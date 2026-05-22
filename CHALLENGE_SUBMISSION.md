# Submission

## What I Did

### Frontend

- **Feature-based folder layout.** Moved the page out of `app/components/` into `app/pages/shortener/`, split into `components/`, `actions/`, `loaders/`. Routes (`app/routes/_index.tsx`) are now thin re-exports. Why: keeps each feature self-contained — adding a second feature later doesn't mean shuffling files around at the root.
- **Radix UI Themes** (`@radix-ui/themes`, indigo accent, sand gray, full radius) instead of hand-rolled Tailwind classes. Why: consistent design tokens, accessibility baked in, faster to ship a presentable UI than designing one from scratch. Tradeoff: the bundle gets bigger — fine for this brief, I'd reconsider for a public-facing landing page.
- **Kabilio look.** Custom `app.css` overrides the Radix palette to the cream + pastel set from kabilio.es, pairs Manrope with Geist Mono, and moves fonts off the CDN.
- **Toasts via `sonner`** for copy-to-clipboard feedback instead of `alert()`. Non-blocking and looks better.
- **Icons via `lucide-react`** (Copy, ExternalLink, Sparkles, Links) for affordances on the form and the list.
- **Error feedback wired end-to-end.** The action maps domain errors to HTTP statuses (`InvalidUrlError` → 400, `RateLimitExceededError` → 429, `CodeCollisionError` → 503) and back to a field-level error in the form. The list shows the last 20 links and their click count.
- **CSRF token** generated server-side and validated in the action, embedded in the form.

### Backend (`@url-shortener/engine`)

- **Hexagonal layout.** `libs/engine/src/` now has `domain/` (value objects, errors, ports), `application/` (use cases), `infrastructure/` (Prisma + Redis + nanoid adapters), and `test-support/` (in-memory fakes). Use cases depend only on ports, so swapping the DB or the cache is a one-file change. Why: it's the layout I reach for when I expect a thing to grow, and the original code had zero separation.
- **Three use cases** in `application/`:
  - `shorten-url.use-case.ts` — validates, rate-limits, generates a code with collision retry (3 attempts), persists, pushes to the recent list.
  - `resolve-short-code.use-case.ts` — Redis cache → DB fallback → fire-and-forget click increment.
  - `list-recent-urls.use-case.ts` — Redis recent-list → DB keyset pagination fallback if Redis is unavailable.
- **Real short codes.** Replaced `abc × 2-char` (9 possible values) with `nanoid` 7-char codes drawn from `[A-Za-z0-9-]` (≈ 3.5 × 10¹² combinations). Collisions are still possible, so the use case retries 3 times and the DB unique constraint is mapped to a `CodeCollisionError`.
- **Prisma 7 + Postgres 16.** The `shortened_url` table is **HASH-partitioned by `code` into 64 children** (the DDL is hand-written in `prisma/migrations/20260521164432_init/migration.sql`). Why: 99% of reads are point lookups by code, and hash partitioning prunes every read to one partition without changing the query plan. The composite PK `(id, code)` is the Postgres tax for partitioned tables — the partition key has to be part of every unique index.
- **Domain validation in value objects.** `LongUrl.parse` (http/https only, length ≤ 2048, forbidden-host check) and `ShortCode.parse` (length = 7, `[A-Za-z0-9-]`). No Zod — the surface was small enough that pulling in a dep wasn't worth it.
- **Redis (`ioredis`) does three jobs:**
  1. **Cache** for resolved URLs, 1 h TTL, set on miss.
  2. **Rate limiter**, fixed window per IP — 10 req / 60 s via `INCR` + `EXPIRE`. Returns `retryAfterSeconds`.
  3. **Recent list**, bounded to 100 entries via `LPUSH` + `LTRIM`, feeds the home-page list cheaply.
- **Click tracking** is an atomic `UPDATE clickCount = clickCount + 1, lastClickedAt = now()`, dispatched fire-and-forget from the resolve path so the redirect never waits on it. P2025 (row deleted mid-redirect) is swallowed — admin delete shouldn't 500 the user.
- **Pino** wired in as a `Logger` port so the engine has no stray `console.log` calls outside tests.

### Infra & tooling

- **`docker-compose.yml`**: `db` (Postgres 16) + `redis` (Redis 7) + a one-shot `migrate` service that runs `prisma migrate deploy` before `web` starts. Health checks on all three so `web` only starts when the DB is actually ready.
- **`Dockerfile`**: multi-stage (deps → build → runtime), runs as the non-root `node` user, `react-router/serve` as the production server, `engine.dispose()` on `SIGTERM` for clean Redis/Postgres pool shutdown.
- **Vitest split**: `test` is fast (unit only, in-memory fakes) and `test:integration` boots real Postgres + Redis. Covered: shorten happy path, invalid URL, rate-limit rejection, collision retry, collision exhaustion, resolve cache hit/miss, click tracking, list Redis-down fallback, Prisma repo round-trip.
- **README** updated with the two ways to run things: hybrid (Docker for db+redis, Vite on the host for HMR) and full Docker.

## What I Would Do With More Time

- **Better Backend Integration test.** Currently the only integration test is: 
  [prisma-shortened-url.repository.integration.test.ts]
  (libs/engine/src/infrastructure/persistence/prisma-shortened-url.
  repository.integration.test.ts) instead of using directly the engine.
- **Implement Frontend E2E with Playwright.** 
- **Real analytics view.** Click count per URL is fine for v1, but a proper view needs an append-only events table (timestamp, referrer, UA) separate from `shortened_url` so writes don't contend with the main table.
- **Auth + per-user link ownership** — would link to whatever Kabilio uses (Clerk, Auth0, Keycloak).
- **OpenTelemetry traces** from action → use case → Prisma + Redis. Pino is structured already; just needs an OTLP exporter and the spans wired up.
- **Custom slugs and a content filter** — `forbiddenHosts` is a hardcoded list today; needs to be a config table with an admin UI.
- **Soft delete + audit log** on `shortened_url` (right now a delete is a hole in the history).

## AI Usage

Used Claude Code (Opus) as a pair, not as autopilot. The architecture and the partitioning decision were mine; the model wrote most of the code under my direction and saved me a lot of typing on the boilerplate.

Roughly where I leaned on it:

- Scaffolding the hexagonal layers and the port interfaces.
- Drafting the partitioned-table migration DDL (`HASH (code)` with 64 children + the composite PK quirk).
- Writing the in-memory fakes in `test-support/` and the first pass of the Vitest specs.
- Reviewing the diff at the end and catching dead imports / missing aria attributes.

Example prompts I used (paraphrased):

- *"Design a hexagonal package layout for `libs/engine/src` with ports for repo, cache, rate-limiter, code generator, recent-list, and logger. Keep the domain layer free of any infra dependency."*
- *"Write a Postgres migration that hash-partitions `shortened_url` by `code` into 64 children, with a composite PK `(id, code)` and a unique index on `code`. Use raw SQL because Prisma migrate can't express partitioning."*
- *"Add a Vitest test for the collision-retry path in `shorten-url.use-case.ts` using an in-memory repo and a queue-based code generator fake that yields the same code twice, then a fresh one."*

What I did **not** delegate: the architectural choices (hexagonal, hash partitioning, Redis-first recent list), the visual direction (matching kabilio.es), and the validation rules.

## Feedback
