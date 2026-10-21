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
