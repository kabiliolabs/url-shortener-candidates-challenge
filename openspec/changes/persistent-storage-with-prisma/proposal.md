# Proposal

## Why

Shortened URLs currently live only in an in-memory `Map`, so every restart or redeploy silently erases all data - a direct violation of the challenge's "data survives server restarts" requirement and a blocker for the click-tracking and listing features planned next. A real, durable datastore behind the `UrlRepository` interface (from `refactor-backend-architecture`) fixes this without touching any use case.

## What Changes

- Add a Prisma schema with a `ShortUrl` model: `id`, `code` (unique), `originalUrl`, `clicks` (`Int`, default `0`), `createdAt`. The unique constraint on `code` doubles as its index.
- Implement `PrismaUrlRepository` fulfilling `UrlRepository`; keep `InMemoryUrlRepository` available for fast unit tests.
- Add a PostgreSQL service to `docker-compose.yml` with a named volume (data survives `docker compose up`/`down` cycles) and a healthcheck.
- Run database migrations automatically when the container starts - `docker compose up --build` remains the only command needed, with no manual migration step.
- Add a `GET /health` endpoint that reports whether the database is reachable.
- Add `.env.example` entries for `DATABASE_URL`; no connection string is hardcoded anywhere in source.
- The database's `UNIQUE` constraint on `code` becomes the authoritative backstop behind the application-level retry loop added in `unique-short-code-generation` - a constraint violation on insert is the "collision" signal that loop already expects from the repository.

## Out of Scope

- Click increment logic and the URL-listing endpoint (`click-tracking-and-abuse-protection`).
- Input validation and rate limiting (`click-tracking-and-abuse-protection`).
- Any UI changes (`frontend-redesign`).
- Changing database engines later - this change commits to PostgreSQL (see `design.md` for the SQLite-vs-PostgreSQL trade-off).

## Capabilities

### New Capabilities

- `url-shortening`: the guarantee that a successfully shortened URL is persisted as a durable record (code, original URL, click count, creation time) that survives application and container restarts, and that storage itself enforces code uniqueness.
- `service-health`: the `GET /health` endpoint contract used to report whether the service and its database dependency are operational.

### Modified Capabilities

(none - the storage-level uniqueness enforcement is an implementation detail behind the existing `short-code-generation` retry contract, not a change to its requirement text)

## Impact

- New: `prisma/schema.prisma`, `prisma/migrations/`.
- `libs/engine/src/infrastructure`: new `PrismaUrlRepository`, Prisma client wiring.
- `docker-compose.yml`: new `db` service, named volume, healthcheck; `web` depends on `db` being healthy.
- `Dockerfile`: `prisma generate` at build time; `prisma migrate deploy` at container start.
- `.env.example`: `DATABASE_URL`.
- New route: `GET /health`.
