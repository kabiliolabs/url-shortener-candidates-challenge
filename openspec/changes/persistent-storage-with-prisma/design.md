# Design

## Context

Storage today is an in-memory `Map` behind the `UrlRepository` interface from `refactor-backend-architecture`. `docker-compose.yml` currently defines a single `web` service with no database. See `proposal.md` for motivation and `specs/url-shortening/spec.md` and `specs/service-health/spec.md` for the resulting contracts.

## Goals / Non-Goals

**Goals:**
- Durable storage that survives container restarts, reachable only through `UrlRepository` (no use case changes).
- A single `docker compose up --build` remains sufficient - no manual migration or seeding step.
- Make the database's health independently observable.

**Non-Goals:**
- Multi-instance / horizontally-scaled migration safety (out of scope for a single-instance challenge app).
- Connection pooling tuning or read replicas.

## Decisions

**PostgreSQL over SQLite.** SQLite would be the simpler default for a 2-hour, single-container challenge: no second service, no network hop, a single file to back up. PostgreSQL requires an extra `db` service, a named volume, and a healthcheck/startup-ordering dance with `web`. It was chosen anyway because: (1) it matches typical production usage more closely than a file-based engine, which matters for a senior-engineer evaluation; (2) it gives the atomic `UPDATE ... SET clicks = clicks + 1` used by `click-tracking-and-abuse-protection` well-defined concurrent-write semantics under Docker's bridge networking, without SQLite's single-writer file-locking caveats; (3) the challenge brief explicitly lists "SQL or NoSQL" with no preference and encourages Prisma, which supports both equally well. The added `docker-compose.yml` complexity (one more service block, one more volume, one healthcheck) is small and does not compromise the "single command" requirement.

**`prisma migrate deploy` run automatically at container start, not `db push` or a manual step.** `prisma migrate deploy` applies committed migration files without generating new ones, which is the documented production-safe command and keeps a migration history in the repo. `db push` was rejected because it skips migration history (fine for prototyping, not for a reviewable schema change). A manual `pnpm prisma migrate deploy` step was rejected because the challenge requires everything to run via `docker compose up --build` alone.

**`web` waits on `db`'s healthcheck, not just container start.** Postgres accepts TCP connections before it's actually ready to serve queries during first-time initialization. `docker-compose.yml`'s `db` service gets a `pg_isready`-based healthcheck, and `web` uses `depends_on: db: condition: service_healthy`, so the startup migration never races an unready database.

**Named volume for Postgres's data directory.** Ensures `docker compose up`/`down` cycles keep data; a deliberate `docker compose down -v` (or removing the volume) still wipes it, which is the expected, explicit way to reset state.

**Concurrent code generation is serialized by the `UNIQUE` index, not an explicit lock.** No `SELECT ... FOR UPDATE`, advisory lock, or serializable transaction is used. `shortenUrl`'s pre-check (`UrlRepository.exists(code)`, from `unique-short-code-generation`) is only an optimization to skip an obviously-wasted insert; it does not by itself prevent two concurrent requests from both observing "does not exist" and then both attempting to insert the same code (a classic check-then-act race). Correctness instead comes from the `code` column's `UNIQUE` constraint: PostgreSQL's unique B-tree index makes two concurrent inserts of the same key mutually exclusive at the storage-engine level - if both transactions attempt to insert the same code, one commits and the other fails with a unique-constraint violation (Prisma surfaces this as error `P2002`). `PrismaUrlRepository.save()` maps that specific error to the same collision signal the `shortenUrl` retry loop already expects, so the use case retries with a freshly generated code instead of crashing or silently overwriting data. Given the retry budget (5 attempts) and the 62^7 keyspace from `unique-short-code-generation`, an explicit lock would add acquire/timeout/release complexity to guard against an event that is already both exceedingly rare and already handled safely.

## Risks / Trade-offs

- [The existence pre-check and the insert are two separate round-trips, so a race window exists between them under concurrent requests] -> Mitigation: the `UNIQUE` constraint is the actual safety net, not the pre-check; a race landing in that window surfaces as a `P2002` on insert, which is treated as a normal collision and retried - never as data corruption or a crash.
- [Running migrations from the app container on every start is unsafe if ever scaled to multiple instances racing the same migration] -> Mitigation: acceptable for this single-instance challenge app; call out as a known simplification, not hidden.
- [Prisma's generated client and query engine binaries must exist in the production image, or the app fails at runtime with "Prisma Client not generated"] -> Mitigation: explicit Dockerfile step to run `prisma generate` in the build stage and copy the generated client into the production stage (tracked in `tasks.md`).
- [Postgres adds operational surface (a second container, a volume, a healthcheck) versus SQLite] -> Mitigation: accepted per the decision above; kept to the minimum needed (one service, one volume, one healthcheck).

## Migration Plan

This introduces the first migration (`init`), so there is no prior schema to migrate from. Rollback, if ever needed before this reaches production use, is a plain revert of the commit plus removing the named volume.
