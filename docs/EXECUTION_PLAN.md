# Execution plan

## Purpose

This document records the implementation sequence, the architectural decisions
behind it, and the reason for each planned modification. The goal is to keep the
system easy to explain, test, operate, and evolve.

The implementation follows three complementary principles:

- **Domain-Driven Design:** domain language and invariants are represented in
  value objects, domain errors, and application use cases.
- **Clean Architecture:** dependencies point inward. Domain and application
  code do not depend on HTTP, React Router, Prisma, PostgreSQL, or filesystem
  details.
- **Test-Driven Development:** behavior is specified by failing tests before the
  smallest implementation is introduced, followed by refactoring.

## Decisions already made

### Domain and application

`libs/engine` owns the domain model, application use cases, and ports. It must
remain independent from delivery and persistence technologies.

This gives the core behavior a stable home and lets us test URL validation,
code generation, collision retries, click tracking, and ordering without a
database or HTTP server.

### Persistence

Prisma and PostgreSQL are the persistence choice. PostgreSQL is used because
short-code uniqueness and click counting are write-sensitive operations where
database constraints and atomic updates matter.

Prisma stays behind the `UrlRepository` port. This keeps the domain independent
from the ORM and leaves room to change the persistence implementation later.

### Delivery

React Router remains responsible for loaders, actions, redirects, and server
rendering. Routes translate HTTP concerns and delegate behavior to use cases;
they do not contain business rules or Prisma queries.

### Runtime

The web application and PostgreSQL run with Docker Compose. PostgreSQL uses a
named volume, a healthcheck, and versioned migrations. The web service applies
migrations before serving traffic.

### Protected files

`CHALLENGE_DESCRIPTION.md` and `CHALLENGE_SUBMISSION.md` are protected input
artifacts. Agents must not edit, rename, move, delete, format, or regenerate
them. Any final submission wording for those files must be handled by the
repository owner.

## Execution sequence

### 1. Domain and application use cases with TDD — 30 minutes

#### Work

- Configure Vitest in `libs/engine` and expose the workspace test script.
- Add behavioral tests for destination URL validation and short-code validity.
- Add tests for creating, resolving, and listing short URLs.
- Add tests for invalid input, missing records, collision retries, and retry
  exhaustion.
- Implement the `DestinationUrl` and `ShortCode` value objects.
- Implement the `ShortUrl` domain model and explicit domain/application errors.
- Define `UrlRepository`, `ShortCodeGenerator`, and `Clock` ports.
- Implement `CreateShortUrl`, `ResolveShortUrl`, and `ListShortUrls`.
- Use an in-memory repository, a deterministic code generator, and a fixed clock
  in use-case tests.

#### Why

The important behavior is independent from infrastructure. Starting with tests
forces the business rules to be explicit and prevents the database or route
implementation from becoming the source of truth.

The ports exist for concrete reasons: repositories isolate persistence,
generators make collision behavior deterministic, and clocks make timestamps
stable in tests. No abstraction is added merely for naming purposes.

#### Acceptance criteria

- Invalid and unsupported destinations produce explicit errors.
- Valid destinations are trimmed and persisted through the repository port.
- Short codes have the required URL-safe format.
- Collisions are retried a bounded number of times.
- A missing code produces a not-found error.
- Resolving a code increments exactly one click through the repository port.
- Listing returns newest records first.
- Domain and use-case tests pass without Prisma or React Router.

### 2. Prisma and PostgreSQL — 30 minutes

#### Work

- Define `prisma/schema.prisma` with a `ShortUrl` model.
- Add a versioned PostgreSQL migration.
- Add `@prisma/client` to the web runtime and Prisma CLI tooling to the
  workspace.
- Generate the Prisma Client from the schema.
- Implement `PrismaUrlRepository` in the web infrastructure layer.
- Map Prisma `P2002` unique violations to `ShortCodeAlreadyExistsError`.
- Map Prisma `P2025` missing-record errors to `null`.
- Use `clicks: { increment: 1 }` for atomic click tracking.
- Add a reusable server-side `PrismaClient` instance.
- Add a PostgreSQL service, healthcheck, dependency condition, and named volume
  to Docker Compose.
- Apply migrations from the web container before starting the server.

#### Why

The database must enforce invariants that cannot safely be guaranteed by an
application-level pre-check. A unique index prevents races between concurrent
creates, while an atomic increment prevents lost click updates.

The adapter translates infrastructure-specific errors at the boundary, so the
application layer can reason in domain terms rather than Prisma error codes.

The healthcheck prevents the web process from attempting migrations before the
database is ready. The named volume makes persistence survive container
recreation.

#### Acceptance criteria

- The schema and migration create the expected table and indexes.
- `code` has a database-level unique constraint.
- The repository maps database records to the domain model.
- Collision and missing-record errors are translated intentionally.
- Click increments are atomic database operations.
- `docker compose config` resolves successfully.
- Migrations are applied before the web service starts.

### 3. HTTP and frontend — 30 minutes

#### Work

- Complete the server composition root and wire repositories, generators,
  clocks, and use cases there.
- Replace route-level access to the legacy file repository with use-case calls.
- Keep loaders and actions focused on parsing input, invoking services, and
  returning HTTP responses.
- Map expected errors to intentional statuses: `400`, `404`, `409`, and `429`.
- Return a safe `500` response for unexpected failures and log details only on
  the server.
- Keep rate limiting behind a small delivery/infrastructure abstraction.
- Keep the form, feedback, result, and URL list presentation cohesive through
  consistent markup and shared styling.
- Preserve loading, validation, success, empty, and failure states.
- Make controls keyboard accessible and expose errors with appropriate alert or
  live-region semantics.
- Ensure the URL list displays the short URL, destination, creation date, and
  click count without duplicating path segments.

#### Why

The composition root is the single place where volatile implementations are
selected. Routes remain easy to read and test because they do not own business
decisions or persistence details.

Explicit HTTP statuses let clients distinguish invalid input, throttling,
missing resources, and server failures. Consistent UI primitives keep the
interface readable and make accessibility and feedback behavior visible in the
route component.

### 4. Verification and documentation — 20 minutes

#### Work

- Run the complete Vitest suite.
- Run source and test typechecks.
- Run the production build.
- Validate the Prisma schema and migrations.
- Run `docker compose config`.
- When the Docker daemon is available, run the Docker build and a smoke flow:
  create a URL, list it, resolve it, resolve it again, and verify the click
  count and refreshed dashboard state.
- Verify persistence after restarting the web service and database container.
- Update the README Docker and local setup instructions.
- Keep `docs/ARCHITECTURE.md` synchronized with the actual dependency graph.
- Prepare the required submission notes and AI usage explanation for the
  repository owner without modifying the protected submission artifact.

#### Why

The checks cover different failure classes: tests validate behavior, typecheck
validates contracts, build validates packaging, migrations validate the schema,
and the smoke flow validates the deployed system as a whole.

Documentation is part of the implementation because the architectural value is
lost if the next engineer cannot reproduce the setup or understand the trade-offs.

#### Acceptance criteria

- Tests, typecheck, and build pass from a clean install.
- Prisma schema validation passes.
- Docker configuration is syntactically valid.
- Docker build and the smoke flow pass when the daemon is available.
- README and architecture documentation describe the running system, not an
  intended future state.
- AI usage is documented with concrete responsibilities, decisions, and
  verification performed by the engineer.

## Definition of done

The implementation is complete when:

- all three product flows work: create, resolve/count, and list;
- persistence uses Prisma/PostgreSQL rather than the legacy file repository;
- domain and application code remain infrastructure-independent;
- collision handling and click counting are safe under concurrent writes;
- expected errors have intentional HTTP responses;
- the UI gives clear feedback for pending, success, empty, and failure states;
- automated checks and Docker verification have been run and recorded;
- documentation matches the code and known operational limitations.

## Known operational trade-offs

- The in-process rate limiter supports a single web instance. A horizontally
  scaled deployment would use a shared store such as Redis.
- Authentication, ownership, custom aliases, expiration, and analytics are not
  part of the current product boundary.
- PostgreSQL is more operationally involved than SQLite, but provides stronger
  relational and concurrent-write behavior for this system.
