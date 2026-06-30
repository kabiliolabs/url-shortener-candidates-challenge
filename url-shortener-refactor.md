# URL Shortener Refactor

## Goal
Turn an intentionally broken URL shortener into a service with a resilient architecture (`libs/engine`: domain → application → infrastructure), persistence in PostgreSQL via Prisma, protection against open redirect/abuse, click statistics, and a clean UI — all verifiable in Docker.

## Context / decisions already made
- DB: **PostgreSQL + Prisma** (locked in, do not revisit).
- The engine lib must NOT export mutable state — only use-cases/types. No `process.env` in `libs/engine`: `baseUrl`/runtime config lives in the web app (`app/.server/config.ts`), not in the domain.
- Code uniqueness — via a `UNIQUE` constraint in the DB + retry on conflict. **Retry lives in the use-case, not in the repository**: the repository only translates Prisma `P2002` into the domain error `DuplicateCodeError`; the use-case catches it, generates a new code, and retries. The DB adapter must not know how short codes are created (separation of storage and generation).
- Click increment — atomic (`{ clicks: { increment: 1 } }`), not read-modify-write.
- **Open redirect is not "eliminated"; instead the redirect is made controlled/validated**: a URL shortener by nature redirects to external addresses. Only `http`/`https` are accepted; unsafe schemes (`javascript:`, `data:`, `file:`) and malformed URLs are rejected at creation time.
- **Prisma client/server boundary**: `@prisma/client` must not end up in the client bundle. `libs/engine` is a pure domain library **with no dependency on Prisma at all**; it exports only domain/application/types. The entire Prisma surface (schema, migrations, adapter) lives in `applications/web/app/.server/` and is imported only from `loader`/`action`. No package exports with Prisma — there is physically nothing through which the boundary could be broken.
- Current stack: pnpm + Turbo monorepo, React Router v7 SSR, Vite (`ssr.noExternal: ["@url-shortener/engine"]` — meaning the engine is bundled directly into the web app's SSR bundle, a separate engine build is not needed at runtime).
- No existing tests — we add them from scratch. UI on Tailwind (already in the stack); Radix/shadcn — only if a complex primitive is actually needed, not for basic input/button.

---

## Phase 1 — Postgres + Prisma setup
> The entire Prisma surface (deps, schema, migrations, adapter) lives **in `applications/web`**, not in `libs/engine`. This way `libs/engine` stays a pure domain library with no dependency on `@prisma/client`, and there is nothing through which the boundary could be broken — Prisma is physically absent from the package that the route modules with React components import.
- [x] Add `prisma`, `@prisma/client` to `applications/web/package.json`; create `applications/web/prisma/schema.prisma` with the model `ShortUrl { id, code @unique, originalUrl, clicks Int @default(0), createdAt DateTime @default(now()) }` → Verify: `pnpm --filter web exec prisma validate` with no errors.
- [x] Add a `postgres` service to `docker-compose.yml` (image `postgres:16-alpine`, volume for data, healthcheck) + `DATABASE_URL` in `.env.example` and `docker-compose.yml` → Verify: `docker-compose up postgres` comes up, `docker-compose exec postgres pg_isready` responds ok.
- [x] Run `pnpm --filter web exec prisma migrate dev --name init` locally (Postgres via `docker-compose up postgres` for development) → Verify: migration created in `applications/web/prisma/migrations`, the `ShortUrl` table is visible via `prisma studio` or `psql`.

## Phase 2 — Domain & application layer in libs/engine
- [x] Create value objects: `domain/value-objects/original-url.ts` (validates via `new URL()`, allows only `http:`/`https:`, otherwise throws `InvalidUrlError`) and `domain/value-objects/short-code.ts` → Verify: unit tests for valid/invalid strings (see Phase 5).
- [x] Create the port `domain/ports/short-url-repository.ts` (interface: `save`, `findByCode`, `incrementClicks`, `findAll`) → Verify: `pnpm typecheck` passes, the file is imported by nothing except use-cases.
- [x] Implement `infrastructure/code-generator.ts` based on `nanoid` (custom alphabet base62, length 7) instead of the alphabet `"abc"` of length 2 → Verify: unit test for length/alphabet + a sample for the absence of obvious collisions across 10k generations.
- [x] Add the domain error `DuplicateCodeError` (thrown by the port implementation on a uniqueness conflict; the use-case reacts to it) → Verify: imported from `index.ts`, covered by types.
- [x] Implement the use-cases `application/create-short-url.ts` (generates a code → `repository.save` → on `DuplicateCodeError` regenerates and retries up to N attempts, otherwise rethrows) and `application/resolve-short-url.ts`, taking the repository + generator as dependencies (DI via parameters/factory) → Verify: unit test with a fake repository that forces `DuplicateCodeError` on the first attempt — the use-case successfully saves on the second (a new test double, not the old global `Map`).
- [x] Implement `testing/in-memory-short-url-repository.ts` (a test double implementing the port; throws `DuplicateCodeError` on a duplicate `code`) — for unit tests of the use-cases, replacing the old global `Map`. It lives in a separate `testing/` folder, **not** in `infrastructure/`, and is **not** re-exported from the production `index.ts` → Verify: used only in Phase 5 tests, not imported from routes and not visible in `index.ts`.
- [x] Rewrite `libs/engine/src/index.ts`: export **only** pure domain/application/types — use-case factories, types (`ShortenedUrl`), the `ShortUrlRepository` port, domain errors, value objects, code generator. **No Prisma and no `process.env` in `libs/engine`** — `baseUrl`/environment config stays in the web app (Phase 3); the Prisma adapter is also in web (Phase 3) → Verify: `pnpm typecheck` passes; `grep -r "shortenedUrls" applications/` is empty; `grep -rl "@prisma/client" libs/` is empty; `grep -r "process.env" libs/engine/src` is empty.

## Phase 3 — Web app: Prisma adapter (server-only) + wiring to API + security
- [x] Create `applications/web/app/.server/config.ts` with `baseUrl` (from `process.env.PUBLIC_URL`, with validation/fallback) and remove `libs/engine/src/base-url.ts` — environment config moves to web, the engine no longer knows about `process.env` → Verify: `grep -r "process.env" libs/engine/src` is empty; routes take `baseUrl` from `.server/config.ts`.
- [x] Implement the Prisma adapter `applications/web/app/.server/prisma-short-url-repository.ts` (implements the `ShortUrlRepository` port from `@url-shortener/engine`): `save` catches Prisma `P2002` (unique violation on `code`) and throws the domain `DuplicateCodeError` (does NOT regenerate the code itself); `incrementClicks` via atomic `update({ data: { clicks: { increment: 1 } } })`; `findByCode`/`findAll` — simple queries → Verify: integration test against a test Postgres (docker-compose) — inserting a duplicate `code` throws `DuplicateCodeError`, not a raw Prisma error.
- [x] Create a server-only composition `applications/web/app/.server/short-url.ts`: singleton `PrismaClient` + assembly of the use-cases with the Prisma adapter and generator. **All Prisma lives only in `app/.server/`** — guaranteeing that `@prisma/client` will not end up in the client bundle → Verify: imported only from `loader`/`action`; `pnpm --filter web build` with no Prisma in the browser chunk.
- [x] `applications/web/app/routes/_index.tsx`: `action` calls the `createShortUrl` use-case (from the `.server` module) instead of writing directly to a `Map`; validation errors (`InvalidUrlError`) are mapped into clear messages for the user → Verify: in the browser, submitting `javascript:alert(1)` or `not-a-url` yields an error text, the link is not created.
- [x] `applications/web/app/routes/s.$code.tsx`: `loader` calls `resolveShortUrl` (atomic click increment + redirect); 404 on a missing code stays → Verify: navigating to a valid code redirects and `SELECT clicks FROM "ShortUrl" WHERE code=...` increases by 1 per navigation.
- [x] Add simple rate limiting (in-memory token bucket per IP, sufficient for the scale of the assignment) **only on the link-creation `action`** → Verify: a script looping `curl` to create links beyond the threshold gets `429`. _The redirect is deliberately NOT limited: a popular link must not serve `429` to ordinary users (see Notes)._

## Phase 4 — UI: link list, statistics, clean design
- [x] New route `applications/web/app/routes/links.tsx` with a list of all links (code, original URL, clicks, date) via the `findAll` use-case/repository from the `.server` module → Verify: open `/links` in the browser, see a table from the DB.
- [x] Rewrite the styles of `_index.tsx` into a consistent design on **Tailwind** (remove the chaotic classes from the README's "ugly UI"; extract reusable `Input`/`Button`/`Card` into `app/components/`). Add Radix/shadcn only when actually needed (e.g. a complex component like toast/dialog), not for basic input/button — fewer dependencies. + loading state on submit via `useNavigation` → Verify: visually in the browser — a unified palette, the button shows a loading state during submit.
- [x] Add navigation between the shorten form and `/links` → Verify: manual navigation via the link in the browser.

## Phase 5 — Tests
- [x] Set up `vitest` in `libs/engine` (`package.json` script `test`, config) → Verify: `pnpm --filter @url-shortener/engine test` runs (even with 0 tests).
- [x] Tests for value objects (`OriginalUrl`, `ShortCode`), `code-generator`, use-cases (`createShortUrl`/`resolveShortUrl` with a fake repository) → Verify: `pnpm --filter @url-shortener/engine test` — all green.

## Phase 6 — Docker & documentation
- [x] Update the `Dockerfile`: add `prisma generate` to the build stage (needed for the SSR bundle via `noExternal`), and run `prisma migrate deploy` before `pnpm start` in the production stage (entrypoint/CMD script, the DB is available only at runtime via the docker-compose network) → Verify: `docker-compose up --build` with a clean volume — the container starts with no migration errors.
- [x] Update the "Docker Setup" section in the root `README.md` (environment variables for Postgres, the migration step) — an explicit requirement of the brief → Verify: follow the instructions literally from a clean `docker-compose down -v`, confirm everything matches.

## Phase 7 — Submission & end-to-end check (last)
- [x] Fill in `CHALLENGE_SUBMISSION.md`: what was done and why prioritized this way, what would remain to finish given more time (CSRF after auth appears, advanced abuse protection/captcha, custom aliases, analytics dashboard, e2e tests, distributed rate limiter), how AI was used, feedback on the assignment → Verify: no `<!-- -->` placeholders remain in the file.
- [x] End-to-end smoke test: `docker-compose up --build` from a clean state → create a link → navigate to it (redirect works) → see the click increment on `/links` → `docker-compose restart web` (or `down`+`up` without `-v`) → the data on `/links` persisted → Verify: each step confirmed manually, the result recorded in `CHALLENGE_SUBMISSION.md`.

---

## Done When
- [x] `docker-compose up --build` brings up web + postgres, data survives a container restart (volume).
- [x] The redirect is made controlled/validated: only `http`/`https` are accepted; `javascript:`/`data:`/`file:` and malformed URLs are rejected.
- [x] Code collisions and click increments are handled atomically at the DB level, not by a race in JS.
- [x] `libs/engine` does not export mutable global state and does not depend on `@prisma/client`; routes work through use-cases, Prisma lives only in `app/.server/`.
- [x] `/links` shows real click statistics from Postgres.
- [x] Basic rate limiting is active on link creation (the redirect is deliberately not limited).
- [x] `pnpm --filter @url-shortener/engine test` is green.
- [x] `README.md` (Docker Setup) and `CHALLENGE_SUBMISSION.md` are up to date and filled in.

## Code quality (cross-cutting requirements of the brief, applied in every phase)
- **SOLID**: SRP — code generation / URL validation / storage / orchestration are split across different modules. DIP — use-cases depend on the `ShortUrlRepository` port, not on Prisma. OCP — the code generator and the repository are swappable (in-memory fake in tests, Prisma at runtime) without touching the use-cases.
- **Input validation**: all URL validation is centralized in the `OriginalUrl` value object (the single source of rules), not smeared across routes; the route only maps a domain error into a user message.
- **Clean, maintainable code**: clear layer boundaries domain → application → infrastructure; no "upward" imports across layers; domain errors instead of raw Prisma exceptions at the boundary.
- **Testing for important parts**: test priority — value objects (URL validation), the code generator, use-cases (including retry on `DuplicateCodeError`). This is critical logic, testable without standing up the whole stack. An integration test of the repository against a real Postgres — for the unique constraint and the atomic increment.

## Notes
- Priority when short on time: Phase 1–3 (persistence + security) matters more than Phase 4 (UI polish) and Phase 5 (tests) — the README explicitly says "It doesn't need to be perfect, prioritize." Anything we don't get to — we record in `CHALLENGE_SUBMISSION.md` as "What I Would Do With More Time."
- CSRF on the shorten form is deliberately not added in this plan — there is no authentication/sessions, so the threat is not relevant; mention it as future work.
- Rate limiting on the redirect is deliberately out of scope for the first pass: a popular short link must not get `429` for ordinary users. If abuse protection on resolve becomes necessary — that is a separate task (e.g. a limit per IP+code pair, not globally on the code) and goes into future work.
- Prisma is fully moved into `applications/web` (schema + adapter in `app/.server/`); `libs/engine` is a pure domain library without `@prisma/client`. Fewer package exports with Prisma = less chance of accidentally dragging it into the client bundle.
