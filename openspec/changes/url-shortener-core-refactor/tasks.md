# Tasks

## 1. Persistence foundation (Prisma + SQLite)

- [x] 1.1 Add `prisma` and `@prisma/client` to `libs/engine/package.json`, with a `postinstall` script running `prisma generate`; verify `pnpm install` completes and the generated client exists under `libs/engine/node_modules/@prisma/client`
- [x] 1.2 Define `libs/engine/prisma/schema.prisma` with the `ShortUrl` model (`id`, `code` `@unique`, `originalUrl`, `clickCount` default `0`, `lastClickedAt` nullable, `createdAt` default `now()`), SQLite datasource reading `DATABASE_URL`; verify `prisma migrate dev` creates the local db file and a migration under `libs/engine/prisma/migrations/`
- [x] 1.3 Add `DATABASE_URL` to `.env.example` (e.g. `file:./dev.db`, relative to `schema.prisma`); verify the app's env loading (`envDir: "../.."` in `vite.config.ts`) picks it up in dev

## 2. Domain layer (`libs/engine/src/domain`)

- [x] 2.1 Create `domain/short-url.ts`: the `ShortUrl` entity/type and a pure `generateShortCode()` (base62 alphabet, length 7, no I/O); verify a unit test asserts output length and charset
- [x] 2.2 Create `domain/errors.ts`: `InvalidUrlError`, `ShortCodeExhaustedError`, `ShortUrlNotFoundError` (each a distinct `Error` subclass); verify a unit test asserts each is `instanceof Error` and has a distinguishable `name`
- [x] 2.3 Create `domain/repository.ts`: `IShortUrlRepository` interface (`create`, `findByCode`, `list`, `incrementClick` — using only domain types, e.g. `ShortUrl`, `string`, `number`); verify `grep -r "@prisma/client" libs/engine/src/domain` returns no matches
- [x] 2.4 Create the URL validator (pure function, e.g. `domain/url-validator.ts`) enforcing http/https-only scheme, a max length, and well-formedness, throwing `InvalidUrlError` otherwise; verify unit tests cover a valid https URL, a `javascript:` URL, an oversized URL, and an unparseable string — satisfying the url-shortening spec's "Accept only valid HTTP/HTTPS URLs" requirement

## 3. Application layer (`libs/engine/src/application`)

- [x] 3.1 Implement `ShortUrlService` in `application/short-url-service.ts`, constructed with an injected `IShortUrlRepository`, exposing `createShortUrl(originalUrl, baseUrl)`: validates, generates a code, persists via the repository, retries up to 5 times on a uniqueness conflict, then throws `ShortCodeExhaustedError`; verify unit tests using an in-memory fake `IShortUrlRepository` cover successful creation, `InvalidUrlError` propagation, and retry-then-exhaustion — satisfying the url-shortening spec's uniqueness and code-generation requirements
- [x] 3.2 Add `recordClickAndResolve(code)` and `listShortUrls()` to `ShortUrlService`: the former looks up the code, throws `ShortUrlNotFoundError` if absent, otherwise increments `clickCount`/updates `lastClickedAt` via the repository and returns the destination URL; verify unit tests with the fake repository cover found (stats updated) and not-found (stats untouched) paths — satisfying the url-redirection spec

## 4. Infrastructure layer (Prisma repository)

- [x] 4.1 Implement `PrismaShortUrlRepository` in `infrastructure/prisma-short-url-repository.ts` implementing `IShortUrlRepository` via `@prisma/client` (the only file in `libs/engine` importing it), translating a `code` unique-constraint violation into a signal `ShortUrlService`'s retry loop can detect; verify an integration test against a real test SQLite db covers create → findByCode round-trip and confirms a duplicate `code` insert is rejected by the DB constraint
- [x] 4.2 Update `libs/engine/src/index.ts` to export `ShortUrlService`, the `ShortUrl` type, the three error types, and a factory (e.g. `createShortUrlService()`) that wires a real `PrismaClient` into `PrismaShortUrlRepository` into `ShortUrlService`; verify `pnpm --filter @url-shortener/engine typecheck` passes and no `Map`-based export remains in the barrel

## 5. Route layer integration (`applications/web`)

- [ ] 5.1 Update `app/routes/_index.tsx` `action` to read `PUBLIC_URL` from `process.env` and call `shortUrlService.createShortUrl(url, baseUrl)` instead of `generateShortCode()`/`shortenedUrls.set`, mapping `InvalidUrlError` to a field-level `{ error }` response; verify manually (`pnpm dev`) that a valid URL returns a shortened link and an invalid one returns a specific error
- [ ] 5.2 Update the same route's `loader` to call `shortUrlService.listShortUrls()` and pass the result to the component; verify a newly created entry appears after submission
- [ ] 5.3 Update `app/routes/s.$code.tsx` `loader` to call `shortUrlService.recordClickAndResolve(code)`, redirecting on success and throwing a 404 `Response` when it catches `ShortUrlNotFoundError`; verify manually that visiting a known code redirects and increments its click count (visible in the list), and an unknown code shows the 404 page
- [ ] 5.4 Delete the old `libs/engine/src/shortened-url.ts` and `base-url.ts` stub files once no code imports them; verify `grep -r "shortenedUrls\|generateShortCode" applications/web/app` (excluding the new domain module) returns no matches

## 6. UI: reusable components, loading state, listing view

- [ ] 6.1 Create `app/components/{Button,Input,Alert,Card,Spinner}.tsx` as small Tailwind-based reusable components; verify each renders correctly in the running dev app
- [ ] 6.2 Rebuild the `_index.tsx` submission form and result display using these components, with the error message driven by the action's field-level error; verify manually that submitting an invalid URL shows the specific validation message
- [ ] 6.3 Add `useNavigation()`-based pending state to the submission form (disabled submit button / `Spinner` while `state !== "idle"`); verify manually that the pending state is visible during submission
- [ ] 6.4 Build the listing UI on the `_index` route (one row per `ShortUrl`: code, destination, click count, last-clicked, created date) using a `ShortUrlListItem` component; verify manually that a new entry shows zero clicks and updates after visiting its short link — satisfying the url-listing spec

## 7. Abuse prevention

- [ ] 7.1 Implement `app/lib/rate-limit.server.ts`: a per-IP sliding-window/token-bucket limiter backed by a module-level `Map`; verify a unit test covers requests within the limit succeeding and requests beyond it being rejected
- [ ] 7.2 Call the limiter from `_index.tsx`'s `action` (keyed by the request's source IP) before invoking `ShortUrlService.createShortUrl`, returning a field-level rate-limit error when exceeded; verify manually that rapid repeated submissions eventually receive the rate-limit error — satisfying the url-shortening spec's rate-limiting requirement

## 8. Test tooling and cross-layer integration tests

- [ ] 8.1 Add Vitest as a devDependency with a `test` script in `libs/engine/package.json` and `applications/web/package.json`; verify `pnpm --filter @url-shortener/engine test` and `pnpm --filter web test` both run (even trivially) without config errors
- [ ] 8.2 Add a `test` task to root `turbo.json`; verify `turbo test` runs tests across the workspace
- [ ] 8.3 Write an integration test for `_index.tsx`'s `action` against a real test SQLite db covering the happy path (valid URL → shortened URL returned) and the validation-error path (invalid URL → field error); verify it passes under `turbo test`
- [ ] 8.4 Write an integration test for `s.$code.tsx`'s `loader` covering a known code (redirect issued, click count incremented, observable via `listShortUrls()`) and an unknown code (404); verify it passes under `turbo test`

## 9. Docker persistence and documentation sync

- [ ] 9.1 Add a named volume to `docker-compose.yml` mounted where the SQLite file lives, and set `DATABASE_URL` in the `web` service's `environment` block to point at a path inside that volume; verify `docker-compose up --build` starts and the app is reachable at `http://localhost:3000`
- [ ] 9.2 Add a `prisma migrate deploy` step to the `Dockerfile`'s `production` stage, running before `CMD ["pnpm", "start"]`; verify a fresh `docker-compose up --build` creates the db and that `docker-compose down` followed by `docker-compose up` (no `--build`, volume retained) still shows previously created short URLs — satisfying the url-shortening spec's "persist across restarts" requirement
- [ ] 9.3 Update `README.md`'s Docker Setup section and `.env.example` to reflect the new `DATABASE_URL` variable and any changed steps; verify the documented commands match exactly what was run in 9.1/9.2

## 10. Submission documentation

- [ ] 10.1 Fill in `CHALLENGE_SUBMISSION.md` (What I Did, What I Would Do With More Time, AI Usage, Feedback), noting the documented limitations from `design.md` (single-instance in-memory rate limiting, counter-only click stats, no per-click event log); verify all four sections contain substantive content rather than the placeholder HTML comments

---

**Explicitly deferred (not part of this task list):** P1 — route-level tests beyond 8.3/8.4, a `ClickEvent` per-visit log with referrer/user-agent, pagination on the listing view, further UI polish. P2 — authentication/link ownership, custom/vanity codes, analytics dashboards, Postgres migration, distributed rate limiting, CAPTCHA/bot detection, CI pipeline.
