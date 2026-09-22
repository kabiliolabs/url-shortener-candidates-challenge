# Tasks — 2-hour challenge

Inputs: [spec.md](./spec.md), [design.md](./design.md). The decisions answering OQ1/3/4/6/7 are those in the design's decision table.

**Time box: about 1 hour of implementation.** The tasks follow the proposal's priority order: persistence and architecture, then validation, then clicks and stats, then Docker and docs. Everything that didn't fit is listed under [Deferred](#deferred-to-with-more-time) and in `CHALLENGE_SUBMISSION.md` → "What I Would Do With More Time".

Conventions:
- One commit per task if they are with a message that explains the *why*.
- `pnpm` means `pnpm@10.20.0`. Corepack isn't installed on this machine, so run it as `npx pnpm@10.20.0` or install pnpm globally first.
- **The in-memory storage (`shortenedUrls` Map) must be removed completely.** It is replaced by Postgres in T4, and nothing in-memory stores links after that. Until T4, the old exports (`shortenedUrls`, `generateShortCode`, `baseUrl`) stay only so the app keeps compiling between tasks.
- **Scope change against the design:** there's no custom Express server, because it was only needed for rate limiting (deferred). The app keeps `react-router-serve`.

---

- [x] **T1 — Engine domain: short codes and URL validation** ⏱12
  Add `vitest` to `libs/engine`, a `test` script, a `test` task in `turbo.json` and a root `test` script. Drop the engine's dead `build`/`dev` scripts. Add:
  - `domain/short-url.ts` (entity type)
  - `domain/short-code.ts` (`generateShortCode` with `crypto.randomInt` in base62, 7 characters; `isValidShortCode`)
  - `domain/original-url.ts` (`normalizeOriginalUrl(raw, publicUrl)` → normalized `href`, or throws `UrlValidationError { reason, message }`, running the checks in the design's order)

  *Covers:* R2, R3, R4 (malformed codes), D1
  *Verify:* `pnpm test`, with table-driven tests showing that:
  - codes match `^[0-9A-Za-z]{7}$`; `isValidShortCode` rejects wrong lengths and symbols
  - normalization: trim; `HTTPS://Example.COM:443` → `https://example.com/`; `https:\\evil.com\path` → `https://evil.com/path`
  - rejections: empty → `required`; `example.com` → `missingScheme`; `//evil.com` → `invalid`; `ftp:` and `java\nscript:` → `scheme`; `https://user:pass@x` → `credentials`; self-host (any case) → `selfLink`; 2049 characters → `tooLong`
  - acceptance: a subdomain or other port of `PUBLIC_URL` is accepted

- [ ] **T2 — Port and use cases** ⏱12
  Add:
  - `ports/short-url-repository.ts` (`create`, `recordClick`, `listNewestFirst`)
  - `domain/errors.ts` (`ShortCodeTakenError`, `ShortCodeGenerationError`)
  - `src/testing/in-memory-short-url-repository.ts` (a test double only)
  - `application/{shorten-url,follow-short-url,list-short-urls}.ts`, exported from `index.ts`

  *Covers:* R1, R2, R3, R4, R5, R7, D1
  *Verify:* `pnpm test`:
  - **ShortenUrl:** stores the normalized URL; invalid input → the repository is never called; `[taken, taken, fresh]` → `fresh`; 5 collisions → `ShortCodeGenerationError`; other errors are rethrown
  - **FollowShortUrl:** 3 follows → `clicks 3` and `lastClickedAt` from the injected clock; unknown or malformed code → `null` (a malformed code doesn't call the repository)
  - **ListShortUrls:** newest first

- [ ] **T3 — Postgres and Prisma** ⏱12
  - a `db` service in `docker-compose.yml` (`postgres:17-alpine`, `pg_isready` healthcheck, `pgdata` volume); `DATABASE_URL` in `.env.example`
  - `@prisma/client@7.10.0` and `@prisma/adapter-pg@7.10.0` in `web`, plus the devDependencies `prisma@7.10.0` and `dotenv`
  - `prisma/schema.prisma` (the design's model; output `generated/prisma`, gitignored) and `prisma.config.ts` (loads `../../.env`)
  - scripts `db:migrate` and `db:deploy`, with `prisma generate` added to `build`/`dev`/`typecheck`

  *Covers:* R6, R11 (db service)
  *Verify:* `docker compose up -d db` → `healthy`. `pnpm --filter web db:migrate --name init` creates the migration. `\d short_urls` shows the expected columns, the primary key and the `created_at` index.

- [ ] **T4 — Replace in-memory storage with Postgres** ⏱10
  - `app/.server/config.ts`: requires `PUBLIC_URL` and `DATABASE_URL` and throws an error naming any that's missing; `shortLinkFor(code)` via `new URL`
  - `app/.server/persistence/prisma-client.ts` (one client cached on `globalThis`, using `PrismaPg`) and `prisma-short-url-repository.ts` (`P2002` → `ShortCodeTakenError`; `recordClick` = atomic `update` with `{ increment: 1 }`, and `P2025` → `null`)
  - `app/.server/container.ts`
  - `_index` action: 400 `{ error, input }` / 200 `{ shortLink }`; the error is shown next to the field; the input keeps `defaultValue`; the button is disabled while submitting (`useNavigation`); a one-line public-visibility notice
  - `s.$code` loader: `redirect(url, 302)` or a 404
  - **remove the in-memory solution:** delete `libs/engine/src/shortened-url.ts`, `libs/engine/src/base-url.ts`, their exports, and every import of them

  *Covers:* R1, R3, R4, R5, R6, R8 (partial), R10
  *Verify* (`pnpm dev` with the db running):
  - shortening works, and `curl -I` on the short link → `302` with the right `Location`
  - `/s/zzzzzzz` → 404
  - invalid inputs show their messages
  - `clicks` increases in the database after each follow
  - after restarting the dev server, the link still works
  - starting without `PUBLIC_URL` → an error naming it
  - `grep -rn "shortenedUrls\|shortened-url\|base-url" libs applications --include=*.ts --include=*.tsx` finds nothing

- [ ] **T5 — Stats page and error pages** ⏱6
  Add the `urls` route in `routes.ts` and `routes/urls.tsx`: a loader using `ListShortUrls`; dates formatted on the server in UTC; "Never" when a link has no clicks; an empty state; long URLs truncated with `title` holding the full value; a simple Tailwind table. In `root.tsx`, add header navigation (Shorten / Stats) and an `ErrorBoundary` with a 404 page and "Back to home" link, plus a generic 500 message.
  *Covers:* R7, R4 (not-found page), R1 (generic error)
  *Verify:* links are listed newest first with all fields, and a never-clicked link shows "Never". With an empty table, the empty state appears. After following a link and reloading, the count is updated. An unknown code shows the 404 page with the home link. There are no hydration warnings.

- [ ] **T6 — Docker end to end** ⏱8
  `Dockerfile`: `node:22-alpine` + `apk add openssl`; the build runs `prisma generate`; the production stage copies `prisma/` and `prisma.config.ts`; `CMD` = `prisma migrate deploy && pnpm start`. Compose: `web` depends on `db: service_healthy` and gets `DATABASE_URL`.
  *Covers:* R11, R6, R5 (concurrency check)
  *Verify:*
  - `docker compose down -v && docker compose up --build` → the logs show the migration applied, and on :3000 shortening, redirecting and `/urls` all work
  - `docker compose restart` → the data is still there
  - `seq 50 | xargs -P 50 -I{} curl -s -o /dev/null http://localhost:3000/s/<code>` → `clicks` increases by exactly 50
  - `pnpm typecheck && pnpm test` pass

- [ ] **T7 — README running instructions** ⏱3
  Update `README.md`:
  - **Local Setup:** `pnpm install`, `cp .env.example .env`, `docker compose up -d db`, `pnpm --filter web db:migrate`, `pnpm dev`
  - **Docker Setup** section (required by the challenge): `docker compose up --build`, then open :3000
  - an environment variable table (`PUBLIC_URL`, `DATABASE_URL`) and `pnpm test`

  *Covers:* D2
  *Verify:* following the README from a fresh clone works, both locally and with Docker.

- [ ] **T8 — CHALLENGE_SUBMISSION "What I Did" (last)** ⏱2
  Fill in "What I Did" with what was actually implemented and why it was prioritized. Reconcile the "Decisions" and "What I Would Do With More Time" sections with what was built, and update AI Usage.
  *Covers:* D2
  *Verify:* no template comment is left unanswered, and nothing is described as done that wasn't built.

**Total ⏱ about 65 minutes.**

---

## Coverage

| Req | Tasks | Status |
|---|---|---|
| R1 Shorten | T2, T4, T5 | ✅ |
| R2 Unique codes | T1, T2, T4 | ✅ |
| R3 Validation | T1, T2, T4 | ✅ |
| R4 Redirect | T1, T2, T4, T5 | ✅ |
| R5 Click tracking | T2, T4, T6 (concurrency) | ✅ |
| R6 Persistence | T3, T4, T6 | ✅ |
| R7 Stats list | T2, T5 | ✅ |
| R8 UX | T4 (loading state, disabled button, inline error, notice) | ⚠️ partial: copy button, clipboard failure and mobile layout are deferred |
| R9 Rate limiting | — | ❌ deferred |
| R10 Configuration | T4 | ✅ (verified manually, no unit test) |
| R11 Docker | T3, T6 | ✅ |
| D1 Tests | T1, T2 | ✅ engine only |
| D2 Docs | T7, T8 | ✅ |

**Not covered:** R9 (fully deferred) and part of R8.

## Deferred to "With more time"

Designed and specified, but cut from the 1-hour time box in priority order:
1. **R9 per-IP rate limiting.** This needs the custom Express server so route code can read the client IP, plus the fixed-window limiter, its tests, and 429 + `Retry-After` handling. It's the highest-priority cut, because URL validation already blocks the worst abuse (open redirects, `javascript:` URLs, phishing with embedded credentials).
2. **R8 UI polish.** Reusable components (button, input, card, field error), a copy-to-clipboard button with a failure fallback, a responsive card layout for `/urls` on mobile, and a complete visual redesign.
3. **Tests outside the engine:** config parsing (R10), and integration tests for the Prisma repository against a real Postgres.
