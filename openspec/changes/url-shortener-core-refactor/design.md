# Design

## Context

See `proposal.md` - Why. Constraints carried over from the audit and from explicit direction on this change:
- `applications/web` (React Router v7, framework/SSR mode) has no separate Node/Express/Fastify server — its `loader`/`action` exports are the only server-side data layer, and that stays true after this change.
- `libs/engine` is a workspace package consumed only by `applications/web`, imported as raw TypeScript source (no build step at runtime).
- Stack (React, React Router v7, Vite, Tailwind, TypeScript, pnpm, Turbo) is fixed; no new backend framework, no microservices, no Redis, no auth, no Postgres, no CQRS/event sourcing, no analytics dashboard, no shadcn/Radix.
- Time budget is ~2 hours total for the whole refactor (this change plus its later implementation), so every decision below favors the simplest option that satisfies the spec deltas over a more "correct at scale" alternative.

## Goals / Non-Goals

**Goals:**
- Give `libs/engine` real layering (domain / application / infrastructure) with a persistence-agnostic public contract.
- Make short-code uniqueness a database-enforced guarantee, not an assumption.
- Make storage durable across restarts with the least additional operational surface (no new services, no new network dependency).
- Keep `applications/web`'s routes as thin HTTP adapters over one application service.

**Non-Goals:**
- Supporting multiple storage backends behind the repository interface (only SQLite/Prisma is implemented; the interface exists for testability and layering, not multi-backend flexibility).
- Horizontal scaling of the rate limiter or the app itself (single-instance in-memory rate limiting is accepted as a known limitation).
- Per-click event history (`ClickEvent` log with referrer/user-agent) — deferred to P1, not part of this design.
- Any form of authentication, link ownership, or custom/vanity codes.

## Decisions

### 1. Persistence: SQLite via Prisma, not Postgres or a hand-rolled file store
Prisma+SQLite needs no additional `docker-compose` service, no network/connection-string wiring, and satisfies the challenge's explicit encouragement to use Prisma. A single file (`libs/engine/prisma/dev.db` locally; a Docker named volume in production) survives restarts with zero extra infrastructure.
**Alternatives considered:** Postgres+Prisma — rejected, adds a second container, health-check/wait-for-db logic, and connection config for no benefit at this scale. Raw `better-sqlite3` without an ORM — rejected, forfeits Prisma's encouraged status and requires hand-written migrations/SQL for the same outcome.

### 2. Layered `libs/engine`: domain / application / infrastructure
```
libs/engine/src/
  domain/
    short-url.ts       # ShortUrl entity/type; pure code-generation policy (base62 alphabet, length 7)
    errors.ts          # InvalidUrlError, ShortCodeExhaustedError, ShortUrlNotFoundError
    repository.ts       # IShortUrlRepository interface — no Prisma types/imports
  application/
    short-url-service.ts  # ShortUrlService — orchestrates validation, generation, persistence
  infrastructure/
    prisma-short-url-repository.ts  # implements IShortUrlRepository via @prisma/client — the only file that imports it
  index.ts              # barrel exporting ShortUrlService, ShortUrl type, error types, and a factory to construct a wired service instance
prisma/schema.prisma     # ShortUrl model, code @unique
```
**Alternatives considered:** Keeping a flat `libs/engine` and pushing repository/service logic into `applications/web` instead — rejected, that's the status quo problem: the audit found the actual orchestration already lives in the web app rather than the "domain" library, which is exactly the missing separation of concerns this change fixes.

### 3. `IShortUrlRepository` is persistence-agnostic; `PrismaShortUrlRepository` is the sole adapter
The interface's method signatures use only domain types (`ShortUrl`, plain strings/numbers) — never `@prisma/client` types. This keeps `domain/` and `application/` free of any Prisma import, so they can be unit-tested without a database (using an in-memory fake repository) and so swapping persistence later would only mean writing a new adapter class, not touching business logic.
**Alternatives considered:** Exposing `PrismaClient` directly to the service layer — rejected, it's exactly the "storage as the API" problem the audit flagged in the current `Map`-based stub, just with a different storage engine.

### 4. Collision-safe code generation: base62, length 7, in-app retry + DB `UNIQUE` constraint as the authority
`generateShortCode()` remains a pure function (no I/O) producing a random base62 string of length 7 (62^7 ≈ 3.5×10^12 possible codes). `ShortUrlService.createShortUrl` calls it, attempts to persist, and on a unique-constraint violation from the repository, retries a bounded number of times (e.g. 5) before throwing `ShortCodeExhaustedError`. The `code` column carries `@unique` in `schema.prisma` — that constraint is what actually prevents two entries from ever sharing a code, even under concurrent requests; the retry loop is a UX/perf convenience so a collision (which is astronomically unlikely at this keyspace size but not impossible) doesn't surface as a raw 500.
**Alternatives considered:** Checking for existing codes with a `SELECT` before `INSERT` (check-then-act) — rejected, it's a race condition under concurrent requests (the exact bug class already present in the current stub, just made less likely instead of eliminated); relying on the `UNIQUE` constraint's rejection-and-retry is race-free because SQLite enforces it atomically at insert time.

### 5. `baseUrl` is a parameter, not an environment read inside domain/application
The current `libs/engine/src/base-url.ts` reads `process.env.PUBLIC_URL` directly inside what is nominally the domain package. In the new design, the route layer (which already has access to `process.env` via its Node runtime) reads the public base URL and passes it into `ShortUrlService.createShortUrl(originalUrl, baseUrl)` as a plain argument used only to build the returned display string. Domain/application code never touches `process.env`.
**Alternatives considered:** A small "config" module inside `libs/engine` that reads the env var — rejected as unnecessary indirection; the route layer already owns runtime/environment concerns for this app, and threading one string through one call is simpler than adding a config abstraction for a single value.

### 6. Route layer as a thin adapter over `ShortUrlService`
`app/routes/_index.tsx`'s `action` parses form data, calls `shortUrlService.createShortUrl(url, baseUrl)`, and maps thrown errors (`InvalidUrlError` → field error, rate-limit rejection → field error) to the existing `{ error }`/`{ shortenedUrl }` return shape (extended with field-level detail). Its `loader` calls `shortUrlService.listShortUrls()`. `app/routes/s.$code.tsx`'s `loader` calls `shortUrlService.recordClickAndResolve(code)`, mapping `ShortUrlNotFoundError` to a thrown 404 `Response` and otherwise calling `redirect(url)`. Neither route imports `@prisma/client` or the repository directly.
**Alternatives considered:** Introducing a separate Express/Fastify API server for these operations — rejected per the explicit constraint to preserve React Router v7's SSR loaders/actions as the only server layer; there is no technical need for a second server here.

### 7. Rate limiting: in-process, per-IP, sliding window/token bucket
A small `app/lib/rate-limit.server.ts` module keyed by the request's source IP, called from `_index.tsx`'s `action` before invoking the service. State is a module-level `Map` inside the route layer (not `libs/engine` — rate limiting is an HTTP-boundary concern, not a domain rule).
**Alternatives considered:** Redis-backed distributed rate limiting — explicitly excluded by constraint and disproportionate to a single-instance take-home challenge; documented as a known scaling limitation rather than solved.

### 8. Click statistics: counter + timestamp on the `ShortUrl` row, not an event log
`clickCount` (int, default 0) and `lastClickedAt` (nullable datetime) are updated via an atomic `UPDATE ... SET clickCount = clickCount + 1, lastClickedAt = now()` inside `recordClickAndResolve`. A full `ClickEvent` per-visit log (with referrer/user-agent) is deferred to P1 as noted in the proposal — it adds a second table and richer aggregation for statistics the P0 spec (`url-listing`) does not require.

### 9. Reusable UI: plain Tailwind components, not a component library
`Button`, `Input`, `Alert`, `Card`, `Spinner` are hand-written functional components using the existing Tailwind v4 setup (`@tailwindcss/vite`, CSS-first `@theme`). No shadcn/Radix dependency is added, per constraint and because the existing styling pipeline already covers what's needed for five small primitives.

## Risks / Trade-offs

- **[Risk]** In-memory rate limiter state is lost on restart and not shared across instances → **Mitigation**: acceptable for a single-instance take-home challenge; documented in `CHALLENGE_SUBMISSION.md` as a known limitation, not silently ignored.
- **[Risk]** SQLite under concurrent writers can hit `SQLITE_BUSY` under heavy contention → **Mitigation**: Prisma's default SQLite connection handles typical take-home load; not a concern at this scale, and the `UNIQUE` constraint (not application-level locking) is what protects correctness regardless.
- **[Risk]** `prisma generate` must run before the app can import `@prisma/client`, both in local dev (`pnpm install`) and in the Docker build → **Mitigation**: wire `prisma generate` into a `postinstall` script in `libs/engine/package.json`, and add `prisma migrate deploy` as an explicit step before `pnpm start` in the Docker production stage (see tasks.md).
- **[Risk]** Moving `libs/engine`'s public API from a raw `Map` + free function to a service is a breaking change to its exports → **Mitigation**: the only consumer is `applications/web`, updated in the same change; there is no external consumer to coordinate with.

## Migration Plan

No live data/users to migrate (current storage is in-memory and disposable). Deployment is: build the new `libs/engine`, run `prisma migrate deploy` against the SQLite file (creating it if absent), then start `applications/web` as today. Rollback is a plain `git revert`/redeploy of the previous image; the SQLite file from a partially-applied new version is not reused by the old code path, so no down-migration is required for this challenge's scope.
