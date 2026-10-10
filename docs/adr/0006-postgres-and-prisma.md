# 0006. PostgreSQL with Prisma 7 and versioned migrations

Status: Accepted

## Context
Data must survive restarts; the challenge suggests Prisma.

## Decision
PostgreSQL 17 with Prisma 7 (`prisma-client` generator, `@prisma/adapter-pg`). Schema and migrations live in `libs/engine/prisma`. Prisma types never leave `infrastructure`: repositories map rows to domain objects. Integration tests run against a separate `url_shortener_test` database.

## Consequences
- Schema changes are versioned and applied with `prisma migrate deploy`.
- The generated client is not committed; Turbo generates it before `dev`, `build`, `typecheck` and `test`.
- Prisma 7 driver-adapter errors differ from earlier versions (see `CLAUDE.md` gotchas).
