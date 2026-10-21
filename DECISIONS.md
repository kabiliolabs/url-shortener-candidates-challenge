# Decisions - url-shortener

Why things are the way they are. One entry per decision, added as we go.

**ADR-001: Spec-driven.** Before writing code I wrote [SPECS.md](./SPECS.md), one short paragraph
per feature with an ID. Tests and commits point to those IDs, so it's easy to follow what was built
and why. Coding first and documenting at the end is faster, but the reasoning gets lost.

**ADR-002: Hexagonal architecture + DDD.** The original code had business logic, storage and UI in
the same route file. Now `libs/engine` is the core (domain + use cases, no external deps),
`libs/infrastructure` has the adapters (Prisma, code generator, rate limiter) and `applications/web`
just calls use cases. I went with separate packages instead of folders in one package because then
the core can't import Prisma by accident: the package boundary enforces the dependency rule. A
single bounded context (Shortening) with `ShortUrl` as the aggregate is enough here.

**ADR-003: PostgreSQL + Prisma.** Data has to survive restarts and the challenge suggests Prisma.
SQLite would be quicker to set up, but Postgres is closer to what you'd run in production and
handles concurrent writes (like click counters) properly. It sits behind the `ShortUrlRepository`
port, so changing the database means writing a new adapter and nothing else.

**ADR-004: Clicks are counted atomically in the repository.** The DDD way would be loading the
`ShortUrl`, calling `registerClick()` and saving it, but two clicks at the same time would read the
same value and one would be lost. So the repository port has `registerClick(code, at)`, which the
Prisma adapter turns into a single `UPDATE ... SET clicks = clicks + 1`. It's also one query instead
of two on the hottest path (every redirect). Optimistic locking would keep the logic in the entity,
but retrying redirects isn't worth it here.

**ADR-005: Value objects, typed errors and DTOs.** `OriginalUrl` and `ShortCode` validate in their
factory, so an invalid one can't exist and nobody has to re-check. Business failures are error
classes with a `code` (`INVALID_URL`, `RATE_LIMIT_EXCEEDED`...) and the web maps them to messages and
status codes. Use cases return plain DTOs, so the web never touches domain objects. The rate limit
runs before validation on purpose, so sending garbage also counts towards the limit.

**ADR-006: Testing with Vitest and in-memory fakes.** Use cases are tested against hand-written
fakes of the ports (`test/fakes.ts`): fast, no database, and they show the hexagonal setup pays off.
Tests are grouped by spec ID. Vitest because the project already uses Vite. Adapters get their own
tests in their package.

**ADR-007: Prisma adapter details.** The short code is the primary key: it's the natural key and the
DB guarantees uniqueness without an extra index. The adapter translates Prisma's `P2002` (duplicate)
into `ShortCodeAlreadyExistsError`, so the use case retries without knowing about Prisma. Prisma
stays on v6 with the classic `prisma-client-js` generator, the setup I know best and the least
risky with the time we have. Integration tests run against real Postgres in a separate
`integration_test` schema, so they can wipe tables without touching dev data.

**ADR-008: In-memory, fixed-window rate limiter.** 10 creations per minute per IP. A fixed window
is the simplest algorithm that does the job; a sliding window is fairer at the edges but not worth
it here. Keeping it in memory works for a single instance; with several replicas each one would
count separately, and the fix is a Redis adapter behind the same `RateLimiter` port.
