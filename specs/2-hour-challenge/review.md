# Review — 2-hour challenge

Independent review of `main..HEAD` on `feat/2-hour-challenge` (commit `47609b0`): 41 code files, about 1,100 changed lines, with `pnpm-lock.yaml` and `specs/` excluded. It ran after [verify.md](./verify.md).

## Reviewers

Six reviewers ran in parallel, with no shared context:

| Reviewer | Why it ran | Result |
|---|---|---|
| Maintainability | Always, for code changes | **No findings** against the code-style and architecture rules |
| Blind correctness A + B | The change is over 300 lines and 10 files, and it touches a migration and concurrency | 3–4 low-severity findings each, **3 found by both** |
| Security | User input, HTTP handlers, redirects, config and secrets, dependency manifests | 6 findings, none high severity |
| Resilience | Database I/O and a click write that isn't awaited | 4 findings |
| Reliability | Async ordering, concurrent counters, URL parsing and boundaries | 2 findings |

**Overall:** no high-severity correctness or security bugs. A finding reported by both blind reviewers is high confidence; one reported by a single reviewer is marked *single source*.

## Findings (most severe first)

| # | Where | Defect | Failure scenario | Source |
|---|---|---|---|---|
| 1 | `applications/web/app/.server/persistence/prisma-client.ts:9`, with `libs/engine/src/application/follow-short-url.ts:21` | The `PrismaPg` pool has no connection timeout, query timeout or size limit, and the click writes that aren't awaited share that pool with the redirect's lookup. | Postgres slows down (lock contention, disk stall, a dead connection). Hanging click writes hold all 10 default connections, so the `findByCode` read queues with no limit and redirects hang. A full outage also hangs instead of failing fast. That undoes "never block the redirect". | Resilience, single source, high confidence |
| 2 | `applications/web/app/routes/urls.tsx:14`, `prisma-short-url-repository.ts:38` | `/urls` loads and renders every row on every request, with no limit. | A script creates hundreds of thousands of links (each up to 2048 characters). Every public request to `/urls` then costs hundreds of MB and seconds of CPU, which can crash or stall the single Node process and take redirects down with it. | Security, single source, high confidence |
| 3 | `libs/engine/src/domain/original-url.ts:54` | The self-link check compares host strings exactly. | `https://sho.rt./s/abc` (trailing dot), `127.0.0.1`, `[::1]` and `0x7f.1` all pass, so short links can point at other short links. That hides the destination and inflates clicks. It matches the spec's "exact host" wording (OQ5), but the bypass works. | Security + blind B |
| 4 | `applications/web/app/.server/persistence/prisma-short-url-repository.ts:33` | `lastClickedAt: at` always overwrites the stored value. | Two near-simultaneous click writes commit in reverse order, so `last_clicked_at` ends up older than the latest click (the count stays correct). Fix: `GREATEST(last_clicked_at, $at)` or set the time in the database. | **Both blind reviewers**, low impact |
| 5 | `libs/engine/src/domain/original-url.ts:41` | Scheme-less input with a port parses as a custom scheme. | `example.com:8080/path` or `localhost:3000` gets "Only http and https URLs are allowed." instead of the OQ4 "Your URL should start with http:// or https://". It's still rejected, so nothing bad is stored. | **Both blind reviewers**, low severity |
| 6 | `applications/web/app/routes/_index.tsx:22` | Running out of code-generation retries shows the same generic 500 as a database outage. | 5 collisions in a row → "Something went wrong", not the "meaningful error" R2 asks for. Already a known gap in verify.md. | **Both blind reviewers** |
| 7 | `applications/web/app/routes/_index.tsx:8` | The request body is parsed with no size limit before the 2048-character check, and the raw input is echoed back in the 400 response. | One POST with a URL field hundreds of MB long is buffered entirely in memory and then serialized back. | Security + reliability, low to medium confidence |
| 8 | `applications/web/app/.server/persistence/prisma-short-url-repository.ts:38` | Sorting by `createdAt` has no tiebreaker, and timestamps have millisecond precision. | Links created in the same millisecond appear in an arbitrary order on `/urls`. The fake repository always increases timestamps, so tests can't catch it. | Reliability, single source |
| 9 | `Dockerfile:19-32` | No `USER` directive, so the container runs as root and ships dev dependencies. | If the app or a dependency is compromised, the attacker has root in the container plus the Prisma CLI. Already listed under "production hardening". | Security, single source |
| 10 | `Dockerfile:32`, `docker-compose.yml` | `prisma migrate deploy` has no retry, and there's no `restart:` policy. | A brief connection failure right as the database turns healthy leaves the web container exited for good. | Resilience, single source, medium confidence |
| 11 | `docker-compose.yml:6, 27, 23` | The default credentials are `postgres/postgres` (a superuser), the app uses the superuser at runtime (including DDL rights it doesn't need), and port 3000 is published on all interfaces. | Only matters if the compose file is deployed as is. It's fine for local use. | Security, single source, low severity |

## Confirmed correct by several reviewers

- **Short codes:** retrying on a duplicate code relies on the primary key and retry loop, not on a racy existence check.
- **Click counting:** the increment happens inside the database, so no concurrent click is lost. The click write's rejection always hits `.catch`, so there are no unhandled rejections, and `updateMany` does nothing when the row is missing.
- **Redirects:** 302 to the parser-normalized URL. `javascript:`, `java\nscript:` and CRLF are rejected.
- **Rendering and queries:** React escapes every rendered URL. The only `href`s are short links built from `PUBLIC_URL`, never from the Host header. Prisma queries are parameterized, and the server never fetches stored URLs, so there's no SSRF.
- **Configuration and secrets:** config fails fast on missing `PUBLIC_URL`/`DATABASE_URL`. `.env` is kept out of git and the Docker build context. Stack traces appear only in dev.
- **Architecture:** it matches the design: no I/O in the engine, thin routes, dead code deleted rather than shimmed, and comments that explain *why*.

## Status

**Nothing was changed as a result of this review.** Suggested priority if acted on:
1. **#1:** a pool size and connection/query timeouts on `PrismaPg`. It's small and protects the redirect path.
2. **#4 and #5:** confirmed by both blind reviewers, and cheap to fix.
3. **The rest:** future work (see `CHALLENGE_SUBMISSION.md` → "What I Would Do With More Time").

**Cost:** the reviewers used about 272k tokens (maintainability 61k, blind A 53k, blind B 43k, reliability 42k, resilience 37k, security 36k), plus orchestration.
