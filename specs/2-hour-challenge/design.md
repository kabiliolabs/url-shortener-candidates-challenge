# Design — 2-hour challenge

> **Scope note:** implementation was time-boxed to about 1 hour (see [tasks.md](./tasks.md)). This design is the full target. The following parts are **deferred** and not built in this iteration:
> - **R9 rate limiting:** the custom Express server (`server.js`, `server/app.ts`), `app/.server/rate-limiter.ts` and its tests. The app keeps `react-router-serve`, so the Dockerfile `CMD` is `prisma migrate deploy && pnpm start`.
> - **Most of R8 UI polish:** `app/components/*`, the copy button and the mobile card layout. Inline errors, the disabled submit button and the public-visibility notice are still built.
> - **The web `vitest` setup** (its only planned tests were for config and the rate limiter).
>
> Everything else in this document applies as written.

Inputs: [proposal.md](./proposal.md), [spec.md](./spec.md). Answers to the open questions written inline in the spec are treated as decisions:

| OQ | Decision used here |
|----|--------------------|
| OQ1 | Max URL length **2048** characters, measured on the normalized URL |
| OQ3 | Redirect with **302** |
| OQ4 | Scheme-less input is **rejected**: "Your URL should start with http:// or https://" |
| OQ6 | URLs with embedded credentials are **rejected**: "Embedded credentials are not permitted. They could be used for phishing." |
| OQ7 | **Every** successful redirect counts; no bot filtering |

## Approach

A simplified hexagonal architecture with three pieces. Nothing is added beyond what the requirements need.

```
            driving adapters                 core (no I/O)                driven adapter
┌──────────────────────────────┐   ┌─────────────────────────────┐   ┌──────────────────────────┐
│ applications/web             │   │ libs/engine                 │   │ applications/web         │
│  routes (_index, urls, s/:c) │──▶│  application/ use cases     │──▶│  .server/persistence/    │
│  server.js (Express, IP)     │   │  domain/ rules, entity      │   │   PrismaShortUrlRepo ──▶ Postgres
│  .server/rate-limiter        │   │  ports/ ShortUrlRepository ◀┼───┤   (implements the port)  │
└──────────────────────────────┘   └─────────────────────────────┘   └──────────────────────────┘
                     composition root: applications/web/app/.server/container.ts
```

- **`libs/engine`** holds every business rule: code generation, URL validation and normalization, collision retry, and click recording. It depends only on `node:crypto` and the WHATWG `URL`. It is unit-tested against an in-memory fake repository (D1).
- **Routes** are thin: parse the form or params, call a use case, and map the result or domain error to an HTTP response.
- **The Prisma repository** is the only code that talks to Postgres. It translates Prisma errors into domain errors (`P2002` → `ShortCodeTakenError`, `P2025` → `null`).
- **A custom Express server** (`server.js` + `server/app.ts`) replaces `react-router-serve`. We confirmed `react-router-serve` 7.12.0 creates its handler without `getLoadContext`, so loaders and actions can't see the client IP that R9 needs. The files follow React Router's official `node-custom-server` template: Vite middleware in dev, static files plus the built handler in production. Express's `trust proxy` setting handles `TRUST_PROXY`: with it set to `1`, `req.ip` is the rightmost `X-Forwarded-For` entry; with it off, `req.ip` is the socket address. That is exactly R9.
- **Click counting (R5)** is one atomic SQL statement, `UPDATE … SET clicks = clicks + 1, last_clicked_at = $now WHERE short_code = $code RETURNING *` (Prisma `update` with `{ increment: 1 }`). Resolving the link and counting the click take one round trip, and concurrent clicks can't be lost.

### Use cases (`libs/engine/src/application/`)

| Use case | Input → output | Rules |
|---|---|---|
| `ShortenUrl` | raw form string → `ShortUrl` | `normalizeOriginalUrl(raw, publicUrl)` (throws `UrlValidationError`) → up to 5 attempts of `generateShortCode()` + `repository.create()`; retries only on `ShortCodeTakenError`; after 5 → `ShortCodeGenerationError` |
| `FollowShortUrl` | code → original URL or `null` | `isValidShortCode(code)`, otherwise `null` without querying the database → `repository.recordClick(code, now())` |
| `ListShortUrls` | — → `ShortUrl[]` newest first | pass-through; it exists so routes depend only on use cases, never on persistence |

The generator and the clock are passed into the constructors (with real defaults), so tests can trigger collisions and control time.

### URL normalization and validation (`domain/original-url.ts`)

The checks run in this order. The first failure wins, and each failure has its own `reason` and user-facing message:

1. trim; empty → `required`: "Please enter a URL."
2. no `scheme:` prefix (e.g. `example.com`) → `missingScheme`: "Your URL should start with http:// or https://" (OQ4)
3. `new URL(input)` throws (this includes `//evil.com`) → `invalid`: "This doesn't look like a valid URL."
4. `url.protocol` not `http:` or `https:` → `scheme`: "Only http and https URLs are allowed."
5. `url.username || url.password` → `credentials`: the OQ6 message
6. `url.host === new URL(publicUrl).host` (the parser already lowercased both) → `selfLink`: "Links to this service can't be shortened."
7. `url.href.length > 2048` → `tooLong`: "URLs can be at most 2048 characters."
8. return `url.href`. This value is what gets stored and redirected to (OQ9).

Messages live next to the rules because they are part of the domain's contract, and the route displays `error.message` as is.

### Rate limiter (`app/.server/rate-limiter.ts`)

`FixedWindowRateLimiter(max, windowMs, now = Date.now)` with `hit(key) → { allowed: true } | { allowed: false, retryAfterSeconds }`. It stores a `Map<ip, { windowStart, count }>`. Entries whose window has expired are swept on each `hit` whenever more than a window has passed since the last sweep, so memory is bounded by the number of IPs active in one window. It runs **before** validation in the `_index` action, so invalid submissions count too.

## Affected files / modules

**libs/engine** (the core)
- delete `src/base-url.ts` and `src/shortened-url.ts`
- add `src/domain/{short-url,short-code,original-url,errors}.ts`, `src/ports/short-url-repository.ts`, `src/application/{shorten-url,follow-short-url,list-short-urls}.ts`, and tests next to the code as `*.test.ts`, plus `src/testing/in-memory-short-url-repository.ts`
- rewrite `src/index.ts` (public exports only)
- `package.json`: drop the dead `build`/`dev` scripts (the package is consumed from source), add a `test` script and the `vitest` devDependency

**applications/web**
- add `server.js` (Express entry: dev/prod split, `trust proxy`, listens on `PORT`, default 3000) and `server/app.ts` (`createRequestHandler` + `getLoadContext → { clientIp: req.ip }`)
- add `prisma/schema.prisma`, `prisma/migrations/<ts>_init/`, `prisma.config.ts`
- add `app/.server/config.ts`: reads `PUBLIC_URL` and `DATABASE_URL` (required; throws naming the variable) plus `RATE_LIMIT_MAX` (10), `RATE_LIMIT_WINDOW_SECONDS` (60) and `TRUST_PROXY` (off). `shortLinkFor(code) = new URL("/s/" + code, PUBLIC_URL).href`, which prevents double slashes (R10).
- add `app/.server/persistence/prisma-client.ts` (a single client cached on `globalThis`, because dev hot-reload would otherwise open a new connection pool each time) and `app/.server/persistence/prisma-short-url-repository.ts`
- add `app/.server/rate-limiter.ts` and `app/.server/container.ts` (wiring; module-level singletons)
- add `app/components/`: `button.tsx`, `input.tsx`, `card.tsx`, `copy-button.tsx`, `field-error.tsx`. These are small Tailwind components with no new UI library.
- add `app/routes/urls.tsx`
- rewrite `app/routes/_index.tsx` and `app/routes/s.$code.tsx`
- `app/routes.ts`: add the `urls` route
- `app/root.tsx`: header navigation (Shorten / Stats), plus an `ErrorBoundary` restyled with a "Back to home" link for 404s and a generic message for 500s (stack traces already hidden outside dev)
- `vite.config.ts`: set the SSR build input to `./server/app.ts` (template pattern)
- `package.json`: add `@prisma/client`, `@prisma/adapter-pg`, `express` and `@react-router/express`; remove `@react-router/serve`. DevDependencies: `prisma`, `dotenv`, `@types/express`, `vitest`. Scripts: `dev` = `prisma generate && node --env-file=../../.env server.js`, `build` = `prisma generate && react-router build`, `start` = `node server.js`, `test`, `db:migrate`, `db:deploy`.
- add `app/.server/rate-limiter.test.ts`

**Root and infrastructure**
- `turbo.json`: add a `test` task. Root `package.json`: add a `test` script.
- `docker-compose.yml`: add a `db` service (`postgres:17-alpine`, `pg_isready` healthcheck, named volume `pgdata`). `web` depends on `db: service_healthy` and gets `DATABASE_URL`.
- `Dockerfile`: change the base to `node:22-alpine` plus `apk add openssl` (Prisma's migration engine needs it). The build stage runs `pnpm build`, which includes `prisma generate`. The production stage also copies `server.js`, `prisma/` and `prisma.config.ts`. `CMD`: `prisma migrate deploy && node server.js`.
- `.env.example`: add `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/url_shortener` and the optional rate-limit and proxy variables
- `README.md` and `CHALLENGE_SUBMISSION.md`: D2

## Data and API changes

### Data

A new table from the proposal's model (migration `init`):

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}
datasource db { provider = "postgresql" }   // URL comes from prisma.config.ts (Prisma 7)

model ShortUrl {
  shortCode     String    @id @map("short_code") @db.VarChar(16)
  originalUrl   String    @map("original_url") @db.Text
  clicks        Int       @default(0)
  createdAt     DateTime  @default(now()) @map("created_at") @db.Timestamptz(3)
  lastClickedAt DateTime? @map("last_clicked_at") @db.Timestamptz(3)
  @@index([createdAt])
  @@map("short_urls")
}
```

The port, plus the entity it returns:

```ts
interface ShortUrl { shortCode: string; originalUrl: string; clicks: number; createdAt: Date; lastClickedAt: Date | null }

interface ShortUrlRepository {
  create(input: { shortCode: string; originalUrl: string }): Promise<ShortUrl>;  // throws ShortCodeTakenError
  recordClick(shortCode: string, at: Date): Promise<ShortUrl | null>;            // atomic increment; null if missing
  listNewestFirst(): Promise<ShortUrl[]>;
}
```

### HTTP surface

| Route | Success | Errors |
|---|---|---|
| `POST /` (form field `url`) | 200 `{ shortLink, originalUrl }` | 400 `{ error, input }` validation · 429 `{ error }` + `Retry-After` · 500 `{ error: "Something went wrong. Please try again." }` (database down or code generation exhausted; details logged on the server only) |
| `GET /s/:code` | 302 `Location: originalUrl` | 404 → root `ErrorBoundary` not-found page · 500 → generic error page |
| `GET /urls` | 200 list; dates formatted **on the server** in UTC so the server and browser render the same text (no hydration mismatch) | 500 → generic error page |

The `_index` UI uses `useNavigation().state === "submitting"` for the loading state and disabled button. The input keeps `defaultValue={actionData?.input}` so it survives a full page reload without JavaScript. The public-visibility notice sits under the form.

## Requirement → implementation map

| Req | Where |
|---|---|
| R1 Shorten | `engine/application/shorten-url.ts`; `web/app/routes/_index.tsx` (action + result card); 500 mapping in the action |
| R2 Unique codes | `engine/domain/short-code.ts` (crypto `randomInt`, base62, 7 chars); retry loop in `shorten-url.ts`; primary-key constraint in `schema.prisma`; `P2002` mapping in `prisma-short-url-repository.ts` |
| R3 Validation + normalization | `engine/domain/original-url.ts`; message shown via `field-error.tsx` in `_index.tsx` |
| R4 Redirect | `web/app/routes/s.$code.tsx` (302 / 404); `isValidShortCode` in `short-code.ts`; not-found UI in `root.tsx` `ErrorBoundary` |
| R5 Click tracking | `engine/application/follow-short-url.ts`; atomic `update … { increment: 1 }` in `prisma-short-url-repository.ts` |
| R6 Persistence | Postgres via `prisma-short-url-repository.ts`; `pgdata` volume in `docker-compose.yml` |
| R7 Stats list | `engine/application/list-short-urls.ts`; `web/app/routes/urls.tsx`; `@@index([createdAt])` |
| R8 UX | `_index.tsx` (pending state, notice), `components/copy-button.tsx` (Clipboard API with failure message), responsive Tailwind in `components/*` and `urls.tsx` (cards on mobile, table from `md` up) |
| R9 Rate limiting | `web/server.js` (`trust proxy`), `web/server/app.ts` (`clientIp` in the load context), `web/app/.server/rate-limiter.ts`, called first in the `_index` action |
| R10 Configuration | `web/app/.server/config.ts` (throws on missing variables, evaluated when the server build loads); `shortLinkFor` uses `new URL` |
| R11 Docker | `Dockerfile`, `docker-compose.yml` (healthcheck + `depends_on: service_healthy`, `migrate deploy` before start) |
| D1 Tests | `libs/engine/src/**/*.test.ts` (R2, R3, R5 against the in-memory fake), `web/app/.server/rate-limiter.test.ts` (R9) |
| D2 Docs | `README.md`, `CHALLENGE_SUBMISSION.md` |

## Alternatives rejected

- **A separate `libs/database` package for Prisma.** pnpm's isolated `node_modules` plus Vite's SSR bundling mean a source-only workspace package with runtime dependencies (`@prisma/client`, `pg`) either won't resolve in production or has to ship its own build step. It moves to its own package when a second deployable (e.g. a worker) needs it.
- **Keeping `react-router-serve` and reading the IP from `X-Forwarded-For`.** It exposes no socket IP, and trusting a header that any client can set would let anyone bypass R9 by sending a fake IP.
- **A `RateLimiter` port in the engine.** Rate limiting is a delivery-layer concern with a single implementation. A concrete class is enough, and the interface gets extracted when the Redis version (in "more time") arrives.
- **Checking whether a code exists before inserting it.** It has a race condition. Relying on the primary-key constraint plus retry is atomic.
- **Reading, adding one and writing back for clicks.** Concurrent clicks would overwrite each other and be lost (R5).
- **Separate "resolve" and "count click" calls.** Two round trips on the busiest path, and they can disagree. One `UPDATE … RETURNING` does both.
- **shadcn/ui or Radix.** The CLI setup, extra dependencies and path configuration in a monorepo cost too much of the 2h budget for four simple components. The hand-written components use the same Tailwind patterns and can be migrated later.
- **Validation in the route, or with Zod.** The rules are domain logic and must be unit-testable without the framework. A single string field doesn't justify a schema library.
- **`Math.random`, a counter, or a hash for codes.** Covered in the proposal. They are predictable, enumerable, or collide.

## Risks

| Risk | Mitigation |
|---|---|
| The custom server adds a moving part and could make dev and prod behave differently | Follow the official `node-custom-server` template exactly; verify both `pnpm dev` and `docker compose up` |
| Prisma 7 is new: the `prisma-client` generator, `prisma.config.ts` and driver adapters differ from v5/6 examples | Pin 7.10.0 (not the 8.0 RC that npm currently tags `latest`); check `migrate dev` and generate early (task 1) |
| Vite bundling the generated Prisma client, and `@prisma/client` resolving at runtime | `@prisma/client` and the adapter are direct dependencies of `web`, so they resolve from its `node_modules`; verify with `pnpm build && node server.js` before building Docker |
| Alpine + Prisma migrate engine | `apk add openssl`; switch to `node:22-slim` if it still fails |
| R5 concurrency can't be proven by unit tests against the fake repository | It relies on a single atomic SQL `UPDATE`; verify manually with parallel `curl` requests. Integration tests are in "more time". |
| The rate limiter is per instance and resets on restart | Accepted and documented in R9; Redis is in "more time" |
| `/urls` has no limit on how many rows it returns | Fine at challenge scale; pagination is in "more time" |
| A hot row: one very popular link means many concurrent `UPDATE`s on the same row | Acceptable at this scale; buffered counters in Redis are in "more time" |
| Public `/urls` exposes URLs that users meant to keep private | Notice on the form (R8); accounts and ownership are in "more time" |
| Scope overrun (2h) | Build in the proposal's order; UI polish (R8) and `README.md` are the parts that shrink first |
