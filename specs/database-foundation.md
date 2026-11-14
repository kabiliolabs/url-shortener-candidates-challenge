# Database foundation

## Goal

Prepare reusable PostgreSQL infrastructure using Drizzle, without changing the current URL-shortening behavior. This feature establishes the database foundation; repository integration and persistent shortened URLs come later.

## Scope

- Add a private workspace package at `libs/database` using PostgreSQL, `pg` (node-postgres), and Drizzle ORM.
- Provide a concrete `PostgresDatabase` class with a typed client, health check, and connection cleanup.
- Use Drizzle Kit for SQL migration generation and explicit migration application.
- Rename `docker-compose.yml` to `docker-compose.yaml`, preserve the web service, and add PostgreSQL.
- Add isolated database integration tests and document local configuration and commands.

Out of scope: npm publication, shortener repository interfaces or adapters, shortener tables, replacing the in-memory Map, changing use cases or HTTP behavior, collision handling, statistics, abuse controls, and UI changes. Do not copy the references' custom migration runner, transaction context, or generic query utilities.

## Requirements

### Package and lifecycle

- Expose `new PostgresDatabase(config, schema)` as a concrete class, without an abstract base class or inheritance hierarchy. The class owns its connection pool and lifecycle state in private fields. The consumer supplies connection configuration and its schema.
- Return a typed Drizzle client, a connection health-check operation, and an explicit asynchronous `close()` operation that releases the owned connection pool.
- Importing the package must not open database connections or run migrations. Creating the client must not run migrations either.
- Keep the package independent of the engine's domain, application use cases, and web framework. The class is an infrastructure API, not the shortener's future repository abstraction.
- Reject missing or invalid required configuration before attempting a connection. Use a finite connection timeout so an unavailable database does not leave connection attempts waiting indefinitely.
- Propagate configuration and connection failures to the caller with meaningful errors. Do not automatically retry or terminate the process; the consuming application or command owns that decision.

### Schema and migrations

- Application schemas and migrations belong to the consuming application, outside the generic database package. This feature adds no production shortener schema or migration.
- Use Drizzle Kit to generate reviewable SQL migration files from TypeScript schemas and apply pending migrations through an explicit command.
- Document the explicit Drizzle Kit workflow for a future real consumer. Exercise it through package-owned integration tests that create temporary test-only schema, configuration, and migration fixtures. Do not add a separate test-consumer workspace, committed demo migrations/snapshots, or root migration commands without an application schema. Fixtures must not become application tables or public package exports.
- Do not apply migrations on package import, client creation, or web startup. Repeating migration application with no pending migrations must preserve existing schema and data.
- Migration failures must remain visible to the caller; a failed migration command must exit unsuccessfully rather than report success.

### Docker and configuration

- Maintain one `docker-compose.yaml` containing the existing web service and a PostgreSQL service named `postgres`.
- Give PostgreSQL a persistent named volume, a health check, and configurable local credentials and connection settings. Document the configuration in `.env.example` and the README, preserving existing application settings.
- Support starting only PostgreSQL with `docker compose up -d postgres`. Document connection settings for host-run commands and any container-run commands provided.
- Preserve the existing web service behavior. Do not introduce a PostgreSQL startup dependency, health gate, or required database configuration for the web application in this feature.
- Update references to the renamed Compose file and integrate the new package with workspace build, typecheck, and test tooling as needed.

### Verification

- Test through the package's public API and the migration commands, using real PostgreSQL in Docker for integration coverage.
- Use an isolated test database and test-only schema, separate from developer data. Release connections and clean up test-owned resources after execution.
- Cover valid queries, invalid configuration, an unavailable database, migration application and repeat application, migration failures, and connection cleanup.
- Verify that a persisted test record survives a PostgreSQL container restart with its volume retained. This proves database durability, not persistence of shortened URLs.
- Document how to run the database tests and their Docker prerequisites. Missing infrastructure must be reported as unavailable verification, not a passing test.

## Acceptance criteria

1. A test using the package public API imports it without connecting to PostgreSQL, then supplies configuration and schema to obtain a typed client. A health check and query succeed against the test database, and `close()` releases its connections without leaving the test process hanging.
2. Invalid configuration fails before connection attempts. An unavailable database produces an observable error within the configured finite timeout. The package neither retries automatically nor exits the process.
3. The package-owned integration test exercises explicit Drizzle Kit generation and application using temporary schema and migration fixtures. A second application leaves existing schema and records unchanged; a failing migration command reports failure. None of these operations happen implicitly through imports, constructor calls, or web startup.
4. `docker compose up -d postgres` starts a healthy PostgreSQL service. A record written to an isolated test database remains readable after restarting the container with its named volume retained.
5. The web application starts and existing shortening and redirect tests pass with PostgreSQL stopped and database configuration absent. Shortened URLs still use the existing in-memory store.
6. Database integration tests, `pnpm test`, `pnpm typecheck`, and `pnpm build` pass. The Compose configuration and existing web container startup are verified; unavailable checks are recorded explicitly.
7. The README and `.env.example` explain database startup, connection configuration, the future real-consumer migration workflow, test execution, and the fact that shortener persistence is deferred. No production shortener tables, repository integration, or npm publication is introduced.
