# URL Shortener

A React Router 7 application with a domain/application engine and PostgreSQL persistence.

```text
applications/web/app/                 HTTP routes, React components and styles
applications/web/app/bootstrap.server.ts Database configuration and shared instances
applications/web/database/            Runtime configuration and migrations
libs/engine/                         Shortener domain, application and infrastructure
libs/database/                       Generic PostgreSQL/Drizzle infrastructure
```

The project uses pnpm 10.20.0, Turbo, TypeScript, React, Tailwind, Zod, Nano ID,
Drizzle and PostgreSQL 17. Docker uses Node 20; host Node must support `process.loadEnvFile`
(Node 20.12 or newer; Vite requires Node 20.19+ or 22.12+).

## Local setup

```bash
pnpm install
# Create .env only if it does not already exist; preserve existing settings.
cp -n .env.example .env
docker compose up -d --wait postgres
pnpm db:migrate
pnpm dev
```

Open `http://localhost:5173`. Set `PUBLIC_URL` to the externally reachable origin;
short links retain the `/s/:code` route. Host database operations use
`POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, and
`POSTGRES_PASSWORD` from the root `.env` or explicit process environment.
Explicit environment settings take precedence. Turbo passes these settings through
to development/build tasks. The consumer reads configuration lazily on storage use.

The default local database is `url_shortener_dev` at `127.0.0.1:5432`, with user
`url_shortener` and password `local_password`. These are local development defaults.
The published PostgreSQL port binds only to loopback. Changing initialization
credentials does not rewrite an already initialized volume.

## Docker setup

```bash
docker compose up -d --wait postgres
docker compose build web
# Explicit migration using the packaged module schema and web configuration/migrations.
docker compose run --rm --no-deps web pnpm db:migrate
docker compose up -d web
```

Open `http://localhost:3000`. Compose gives web and its migration command the database
host `postgres` and port `5432`; host-run apps use the published host/port. Both use
the same database and named `postgres_data` volume. `DOCKER_PUBLIC_URL` optionally
overrides the container's default public origin `http://localhost:3000` without
changing the host development `PUBLIC_URL`.

PostgreSQL is the sole runtime store. Restarting the web process or PostgreSQL
preserves links. `docker compose down` preserves the volume;
`docker compose down --volumes` deletes its data. Web has no database health dependency:
the home page remains accessible during an outage, while creation and resolution
report HTTP 503. Apply migrations before creating/resolving links.

## Architecture and behavior

The `ShortenedURL` aggregate owns HTTP/HTTPS destination policy and guarded creation.
The shared URL value object preserves existing normalization: trim surrounding
whitespace without canonicalizing the destination. Generic `Result`, `Ok`, and `Err`
represent expected failures. Domain objects and application logic do not import
Nano ID, Drizzle, PostgreSQL, HTTP, or Node infrastructure.

`ShortenURLUseCase` receives `ShortCodeGenerator` and `ShortenerRepository` ports;
`ResolveShortenedURLUseCase` receives the repository. Both execute asynchronously.
The module’s `infrastructure/generation` and `infrastructure/persistence` directories
own the secure Nano ID adapter and PostgreSQL adapter/schema. They are exported through
`@url-shortener/engine/infrastructure`; the core engine entrypoint has no vendor imports.
Web’s `app/bootstrap.server.ts` exposes `bootstrapApplication()`, which constructs
the database, PostgreSQL repository, Nano ID generator, and both use cases explicitly.
Database/repository initialization remains lazy, and configuration failures become
safe application results. The bootstrap returns the use cases plus `close()`.
Routes use one shared bootstrap instance. Cleanup does not initialize an unused database;
after initialization it awaits pool shutdown. Closing is terminal: stop serving requests
before calling `close()` and do not reuse that application afterward. Engine infrastructure does not read environment
settings or manage connection lifecycle. Invalid input causes no generation or repository access.
No import, client construction, health check, or server startup applies migrations.
The generic `@url-shortener/database` package remains schema-independent and exposes
`PostgresDatabase`, its typed Drizzle `db`, `healthCheck()`, and idempotent `close()`.
Its default connection timeout is five seconds.

New codes contain ten case-sensitive characters from `0–9`, `A–Z`, and `a–z`.
The database text primary key enforces code uniqueness. A targeted atomic
`INSERT ... ON CONFLICT (code) DO NOTHING RETURNING` never overwrites existing links.
The use case generates another candidate only after a code conflict, for at most
three total attempts. Every successful submission creates an independent link;
there is no destination deduplication. Existing codes of any length/alphabet are
looked up exactly, without trimming or case changes.

| Outcome | HTTP response |
| --- | --- |
| Created | 200 with `{ shortenedUrl }` |
| Invalid destination/code | Existing 400 validation feedback |
| Three collisions | 503: `Could not create a short link. Please try again.` |
| Storage/configuration failure | 503: `Service temporarily unavailable. Please try again.` |
| Found | 302 to the exact stored destination |
| Missing after a successful query | 404 `Not Found` |

Storage errors never become missing links or expose database details. Invalid stored
destinations also fail safely. The form preserves entered text and replaces prior
success feedback with the latest error.

## Explicit migrations

The engine module owns `infrastructure/persistence/schema.ts`. Web owns
`drizzle.config.ts`, which points to that schema, and committed SQL and metadata in
`database/migrations/`. Web executes migrations explicitly; the generic database
package owns no application tables.

```bash
# After an intentional schema change, generate and review SQL.
pnpm db:generate
# Explicitly apply pending migrations to the configured database.
pnpm db:migrate
```

Repeat application preserves existing data. No automatic migrations or memory fallback
are provided. The production Docker image includes the migration files and tooling.

## Verification

```bash
pnpm test
pnpm typecheck
pnpm build
# Requires a running Docker daemon and Compose 2.24.4+ (!override support).
pnpm test:database
```

Vitest tests cover domain invariants, deterministic injected generator/repository
behavior, three-attempt exhaustion, immediate outage handling, exact lookups,
adapter error translation, route HTTP responses, and form input/result preservation.
They do not depend on probabilistic Nano ID collisions. Run focused tests with
`pnpm --filter @url-shortener/engine test` or `pnpm --filter web test:watch`.

`pnpm test:database` runs the generic database package's isolated PostgreSQL
checks for migration rollback, repeat application, timeout, pool cleanup, and
restart durability. It requires Docker and does not verify the application's
shortener integration. Application tests remain colocated with their source files;
there is no separate `applications/web/tests` directory.

Browser checks remain necessary for visual layout changes.
