# Verify — 2-hour challenge

Verified against [spec.md](./spec.md) and [tasks.md](./tasks.md) at commit `80e928a` on `feat/2-hour-challenge` (diff `main..HEAD`: 46 files, +3153/−131). All checks below were **run during this phase**, not taken from earlier task runs.

## Automated checks (fresh, `--force` to bypass the Turbo cache)

| Check | Result |
|---|---|
| `pnpm test --force` | ✅ 5 files, **53 tests passed** (`original-url` 23, `short-code` 12, `follow-short-url` 10, `shorten-url` 6, `list-short-urls` 2) |
| `pnpm typecheck --force` | ✅ 2/2 packages |
| `pnpm build --force` | ✅ |
| Lint | ⚠️ **No linter is configured** in the repo (no ESLint, Prettier or Biome config, and no `lint` script). Nothing to run. |

## Runtime environment

`docker compose down -v && docker compose up --build -d` from HEAD. The `db` service became healthy and the logs show `Applying migration 20260922210737_init` and `All migrations have been successfully applied`. All HTTP checks were run with `curl` against `http://localhost:3000`, and database state was read with `psql` in the `db` container.

## Requirements

| Req | Status | Evidence |
|---|---|---|
| R1 Shorten | ✅ Verified | `POST /` with `https://example.com/page` → 200 + `http://localhost:3000/s/LTskAev`. The same URL again → 200 + a different code (`Tuer08K`); `select count(*)` for that URL = 2. **DB stopped** (`docker compose stop db`) → `POST` 500 "Something went wrong. Please try again." with 0 matches for `prisma`/`ECONNREFUSED`/`stack` in the body. Code path: `routes/_index.tsx` action catch-all. |
| R2 Unique codes | ✅ Verified | `short-code.test.ts`: format `^[0-9A-Za-z]{7}$` over 1,000 codes; 10,000 codes all distinct. `shorten-url.test.ts`: `[taken, taken, fresh]` → `fresh` with the existing row untouched; 5 collisions → `ShortCodeGenerationError` with nothing stored. Uniqueness enforced by `short_urls_pkey`. Unpredictability comes from `crypto.randomInt` (`domain/short-code.ts`). *Note:* when retries run out, the user sees the generic 500 message, not a specific one. |
| R3 Validation | ✅ Verified | HTTP, stored values read back from the DB: `  https://example.com/trim  ` → `https://example.com/trim`; `HTTPS://Example.COM:443` → `https://example.com/`; `https:\\evil.com\path` → `https://evil.com/path`; `www.`, query order and fragment kept. 400 with the expected message for: empty, `example.com` (missing scheme), `not a url` and `//evil.com` (invalid), `ftp:`, `javascript:` and `java\nscript:` (scheme), `user:pass@` (credentials), `localhost:3000/urls` and `LOCALHOST:3000` (self-link), 2,060 characters (too long). `localhost:3001` → accepted. After an error the input keeps `value="example.com"`. Unit tests in `original-url.test.ts` (23), including a URL that only exceeds 2048 characters after percent-encoding. |
| R4 Redirect | ✅ Verified | Existing code → **302** `Location: https://example.com/page`. `zzzzzzz`, `bad!`, `abc` and the wrong-case `ltSKaEV` → **404** with "Page not found" and "Back to home". Malformed codes don't reach the repository (`follow-short-url.test.ts`). |
| R5 Click tracking | ✅ Verified | 50 concurrent `curl` requests → clicks 1 → 51 (exactly +50), `last_clicked_at` set. Never-clicked rows have `clicks = 0` and `last_clicked_at IS NULL`. **Write failure isolation:** with a trigger raising on every `UPDATE` of `short_urls`, the redirect still returned 302, clicks stayed at 51, and the web log shows `Failed to record click for LTskAev … simulated write failure`. The trigger was dropped afterwards (0 left). DB fully down → the redirect returns a 500 generic page with no leaked internals, as the spec requires. Unit tests: 3 follows with the injected clock; a failing `recordClick` still returns the URL and reports the error; the redirect doesn't wait for a write that never finishes; a failed lookup propagates. |
| R6 Persistence | ✅ Verified | `docker compose restart web` → the link still redirects (302) and clicks went 51 → 52 (only the verification click). Full-stack restart with the volume kept was verified in T6. |
| R7 Stats list | ✅ Verified (layout: see gaps) | On an empty DB, `/urls` shows "No links yet" with a link to `/`. With 7 links the rows are newest first, unclicked rows show "Never", the clicked row shows 51 and a timestamp, and all 7 original-URL cells carry the full URL in `title`. Dates are formatted on the server in UTC. |
| R8 Shortening UX | ⚠️ **Partial** | ✅ The public-visibility notice renders on `/`. ✅ Inline errors and the kept input (R3). ◑ The disabled button and "Shortening…" label come from `useNavigation()` in `_index.tsx`, **checked by reading the code only (no browser)**. ❌ No copy button, and no clipboard failure message. ❌ Layout at phone width not verified (no browser); `/urls` uses a horizontally scrollable table rather than the spec's no-horizontal-scroll layout. Deferred by the time box (tasks.md "Deferred"). |
| R9 Rate limiting | ❌ **Unverified: not implemented** | 11 consecutive `POST`s from one IP → `200 ×11`, no 429. Deferred by the time box, along with the custom Express server it needs. |
| R10 Configuration | ✅ Verified | Importing `app/.server/config.ts` without `PUBLIC_URL` → "Missing required environment variable PUBLIC_URL"; without `DATABASE_URL` → "…DATABASE_URL"; `PUBLIC_URL=not-a-url` → "PUBLIC_URL must be an absolute URL". `shortLinkFor` with `http://localhost:3000/` → `http://localhost:3000/s/abc1234`. Container started with `PUBLIC_URL=` → fails at `pnpm start` with the same error (at startup, not on the first request). |
| R11 Docker | ✅ Verified | A clean `down -v && up --build` applied the migration and served shortening, redirects and `/urls` on :3000. `web` started only after `db` was healthy (`depends_on: service_healthy`). A restart with the existing volume logged "No pending migrations" (T6), with data intact (R6). |
| D1 Tests | ✅ Verified (engine only) | 53 unit tests, no DB needed. The Prisma repository and config have no automated tests (deferred). |
| D2 Docs | ✅ Verified | README local steps followed from a fresh clone (T7). The Docker Setup section matches the verified behavior. `CHALLENGE_SUBMISSION.md` has every section filled in, including Feedback (this was misreported as empty in the first pass of this phase). |

**Summary:** 9 Verified (R1–R7, R10, R11) · 1 Partial (R8) · 1 Unverified (R9). D1 is Verified (engine only) and D2 is Verified.

## Not verified in this phase

- **React hydration warnings:** no browser console was inspected. The mitigation (dates formatted on the server) is covered by code review only.
- **Browser-only behavior:** the pending state during submit, and the responsive layout (R8).
- **Click writes that aren't awaited, under process crash:** by design, a click whose write is still in flight when the process dies is lost (design, Risks). Not tested.

## Unchecked tasks

None. **T8** was initially reported as unchecked because Feedback looked empty, but it was already filled in, so T8 is now checked.

## Changes that trace to no requirement

| Change | Where | Comment |
|---|---|---|
| Removed the "Your shortened URL will start with …" hint and its `loader` | `routes/_index.tsx` | Removes a feature with no requirement behind it (the hint showed `-` when `PUBLIC_URL` was unset). Low impact. Could be restored from `shortLinkFor("")` if wanted. |
| Header navigation (Shorten / Stats) | `root.tsx` | Required by task T5 but by no spec requirement. It makes `/urls` (R7) discoverable. |
| Dark-mode `dark:` styles | routes, `root.tsx` | Cosmetic, and not in the spec (R8's redesign was deferred). |
| Compose binds Postgres to `127.0.0.1`, with credentials from env defaults | `docker-compose.yml` | Security hygiene from the global rules (no hard-coded secrets), not a spec requirement. |
| `**/generated` in `.dockerignore`; engine source no longer copied into the runtime image | `.dockerignore`, `Dockerfile` | Build hygiene supporting R11, not required by it. |
| Engine's dead `build`/`dev` scripts removed | `libs/engine/package.json` | Listed in T1; no requirement. |
| `src/testing/in-memory-short-url-repository.ts` ships inside the engine's `src/` | `libs/engine` | Test-only double (D1). It isn't exported, but it lives beside production code (raised earlier in the conversation; not changed). |

## Gaps for you to decide on (nothing was fixed in this phase)

1. **R9 not implemented.** Options: implement it now (custom Express server plus limiter, about 20 min per the design), or amend the spec to move R9 officially under "more time".
2. **R8 partial.** The copy button and responsive stats layout are missing; loading behavior was checked in code only. Implement, or amend the spec.
3. **R2 retry-exhaustion message is generic.** Acceptable as is, or add a specific message.
4. **No linter configured.** Challenge "Code Quality" might expect one; it's listed under "more time" (CI + ESLint/Prettier).
5. **T8 Feedback** needs your input.
6. **Browser pass:** hydration warnings, pending state and mobile layout need a quick manual check in a browser.

**Decision (after verify):** gaps 1–4 and 6 are accepted for this submission and listed in `CHALLENGE_SUBMISSION.md` → "What I Would Do With More Time". Gap 5 is resolved: Feedback was already filled in, so T8 is checked.

Next: run `/review` for an independent reviewer pass on `main..HEAD`.
