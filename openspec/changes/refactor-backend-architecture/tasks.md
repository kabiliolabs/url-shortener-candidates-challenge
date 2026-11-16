# Tasks

## 1. Characterization tests (safety net, before any refactor)

- [x] 1.1 Add a test runner (Vitest) to `applications/web` (or a shared root config) and verify `pnpm test` runs with zero tests
- [x] 1.2 Write characterization tests for `POST /` against the current implementation (valid URL returns a shortened URL; missing URL returns the current error shape) and verify they pass against unmodified code
- [x] 1.3 Write characterization tests for `GET /s/:code` against the current implementation (known code redirects; unknown code returns 404) and verify they pass against unmodified code

## 2. Domain layer

- [x] 2.1 Create `ShortUrl` entity and domain errors (`InvalidUrlError`, `ShortUrlNotFoundError`, `CodeGenerationError`) in `libs/engine/src/domain` and verify unit tests cover entity construction
- [x] 2.2 Define `UrlRepository` and `CodeGenerator` interfaces in `libs/engine/src/domain` and verify `pnpm typecheck` passes with no implementation yet

## 3. Infrastructure layer (wrapping current behavior, not fixing it)

- [x] 3.1 Implement `InMemoryUrlRepository` (`UrlRepository`) backed by a `Map` in `libs/engine/src/infrastructure` and verify unit tests cover save/find/list
- [x] 3.2 Wrap the existing `generateShortCode` as a `CodeGenerator` implementation and verify a unit test exercises its current (unchanged) output format
- [x] 3.3 Implement `toErrorResponse(error): Response` mapping domain errors to the structured JSON body from the `error-handling` spec and verify unit tests cover every mapped status/code plus the "no leaked stack trace" scenario

## 4. Application layer

- [x] 4.1 Implement the `shortenUrl` use case (constructor-injected `UrlRepository` + `CodeGenerator`) and verify a unit test covers the success path
- [x] 4.2 Implement the `resolveAndTrackClick` use case and verify unit tests cover both the found and not-found (`ShortUrlNotFoundError`) paths
- [x] 4.3 Implement the `listUrlsWithStats` use case and verify unit tests cover empty and populated results

## 5. Composition root and route wiring

- [x] 5.1 Add `composition-root.ts` wiring `InMemoryUrlRepository` and the wrapped `CodeGenerator` into the three use cases and verify a smoke test instantiates it without error
- [x] 5.2 Rewire `applications/web/app/routes/_index.tsx` to call `shortenUrl` via the composition root and map errors with `toErrorResponse`, and verify the group 1 characterization tests still pass (error body shape updated per spec)
- [x] 5.3 Rewire `applications/web/app/routes/s.$code.tsx` to call `resolveAndTrackClick` via the composition root, and verify the group 1 characterization tests still pass
- [x] 5.4 Remove the old `libs/engine` exports (`shortenedUrls`, free-function `generateShortCode`, bare `baseUrl`) once nothing imports them, and verify `pnpm typecheck` and `pnpm build` succeed across the monorepo

## 6. End-to-end verification

- [x] 6.1 Run the full test suite and `docker compose up --build`, and verify the app still shortens a URL and redirects via the browser, with the new structured error body on invalid input
