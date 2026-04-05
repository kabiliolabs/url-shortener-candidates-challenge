---
name: postgres prisma persistence
overview: Replace the in-memory URL store with a PostgreSQL-backed Prisma repository, keep route behavior stable, and add focused tests around the repository-backed flow.
todos:
  - id: add-prisma-postgres
    content: Add Prisma, PostgreSQL configuration, env vars, and Docker wiring for local and containerized runs.
    status: completed
  - id: define-domain-repository
    content: Define the shortened URL domain model and async repository contract that hides ORM details from routes and domain services.
    status: completed
  - id: implement-prisma-repository
    content: Implement the Prisma-backed repository and replace the in-memory Map dependency in the web app flow.
    status: completed
  - id: preserve-route-behavior
    content: Refactor route/domain code to use the repository while keeping validation, redirect, and response behavior unchanged.
    status: completed
  - id: update-tests
    content: Update unit/integration tests to target the repository seam and add focused persistence tests for core flows.
    status: completed
  - id: document-tradeoffs
    content: Update submission notes with setup steps and the persistence architecture tradeoffs.
    status: completed
isProject: false
---

# PostgreSQL Persistence Plan

## Goal

Add real persistence with PostgreSQL and Prisma, introduce a repository abstraction for URL reads/writes, and preserve the current route behavior for create, redirect, and validation.

## Current Seams To Replace

The main persistence seam is `[applications/web/app/domain/url-shortener.server.ts](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/app/domain/url-shortener.server.ts)`, which currently depends on a sync `Map`-like store. Route tests in `[applications/web/tests/routes.integration.test.ts](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/tests/routes.integration.test.ts)` also reach directly into `@url-shortener/engine`'s shared `Map`, so those tests will need to be repointed to the new repository-backed setup.

Essential current behavior to preserve:

- `POST /` with no URL still returns `{ error: "URL is required" }`
- successful create still returns `{ shortenedUrl }`
- `GET /s/:code` still redirects when found
- unknown code still throws `404 Not Found`
- `PUBLIC_URL` still drives the displayed prefix in `[applications/web/app/routes/_index.tsx](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/app/routes/_index.tsx)`

## Proposed Architecture

Keep domain logic in the web app, but move persistence behind an async repository interface.

- Add a domain model centered on a shortened URL record:
  - `code`
  - `originalUrl`
  - `clicks`
  - `createdAt`
- Add a repository contract in the web app, for example under an infrastructure-oriented area such as `[applications/web/app/domain](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/app/domain)` or a small adjacent repository module.
- Have route/domain code depend on repository methods, not Prisma directly.
- Add a Prisma-backed implementation that is the default runtime dependency.

Recommended repository surface:

- `create({ code, originalUrl }): Promise<ShortenedUrl>`
- `findByCode(code): Promise<ShortenedUrl | null>`
- `incrementClicks(code): Promise<void>` or `incrementClicks(id): Promise<void>`
- optionally `list(): Promise<ShortenedUrl[]>` if you want to prepare for the stats/listing view

## Data Model

Use PostgreSQL with Prisma.

Start with a single table/model for this phase:

- `ShortenedUrl`
  - `id`
  - `code` unique index
  - `originalUrl`
  - `clicks` integer default `0`
  - `createdAt`
  - optional `updatedAt`

This keeps the challenge scope tight while satisfying the requested rich domain model. If deeper analytics are needed later, click events can be split into a separate table without changing the route contract.

## File-Level Plan

- Add Prisma to `[applications/web/package.json](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/package.json)` and create `[applications/web/prisma/schema.prisma](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/prisma/schema.prisma)`.
- Add a Prisma client module in the web app, likely under `[applications/web/app](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/app)`, so the client is created once and reused.
- Refactor `[applications/web/app/domain/url-shortener.server.ts](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/app/domain/url-shortener.server.ts)` from sync `Map` operations to async repository calls.
- Update `[applications/web/app/routes/_index.tsx](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/app/routes/_index.tsx)` and `[applications/web/app/routes/s.$code.tsx](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/app/routes/s.$code.tsx)` only as needed to await the async domain methods.
- Reduce `libs/engine` to concerns that still belong there, such as code generation and `PUBLIC_URL` helpers, while removing the in-memory store export from `[libs/engine/src/shortened-url.ts](/Users/gemma/code/url-shortener-candidates-challenge/libs/engine/src/shortened-url.ts)`.
- Update infra files for local and Docker usage:
  - `[docker-compose.yml](/Users/gemma/code/url-shortener-candidates-challenge/docker-compose.yml)`
  - `[Dockerfile](/Users/gemma/code/url-shortener-candidates-challenge/Dockerfile)`
  - `[.env.example](/Users/gemma/code/url-shortener-candidates-challenge/.env.example)`
  - `[README.md](/Users/gemma/code/url-shortener-candidates-challenge/README.md)`
- Document the tradeoffs and architecture change in `[CHALLENGE_SUBMISSION.md](/Users/gemma/code/url-shortener-candidates-challenge/CHALLENGE_SUBMISSION.md)`.

## Testing Strategy

Keep tests focused on behavior, not Prisma internals.

- Update unit tests in `[applications/web/tests/url-shortener.server.test.ts](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/tests/url-shortener.server.test.ts)` to mock the repository interface rather than a `Map`.
- Update integration tests in `[applications/web/tests/routes.integration.test.ts](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/tests/routes.integration.test.ts)` so they verify the same route behavior while using a test repository setup instead of the shared engine `Map`.
- Add focused repository tests for Prisma behavior that matters most:
  - create and fetch by code
  - unique code handling/collision path if implemented now
  - incrementing clicks on redirect
- Run `typecheck` and relevant tests after the refactor.

## Delivery Order

1. Introduce Prisma schema, client wiring, and PostgreSQL configuration.
2. Define the domain entity and repository interface.
3. Implement the Prisma repository.
4. Refactor server/domain functions and routes to use async repository calls.
5. Update and add tests to preserve current behavior.
6. Wire Docker/docs/env so the app and database run together reliably.
7. Record tradeoffs in submission notes.

## Risks To Watch

- The current tests assume synchronous shared state; they will break until the repository seam is introduced cleanly.
- Redirect click counting can accidentally change behavior if it blocks or throws during lookup; preserve redirect semantics and keep the increment path simple.
- Prisma in Docker usually needs explicit schema/client/migration wiring, so build and runtime steps should be planned together rather than patched piecemeal.

