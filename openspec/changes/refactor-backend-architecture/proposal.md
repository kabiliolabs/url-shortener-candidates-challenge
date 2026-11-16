# Proposal

## Why

The two existing route files (`applications/web/app/routes/_index.tsx`, `routes/s.$code.tsx`) directly import and mutate a shared in-memory `Map` exported from `libs/engine`, mixing HTTP parsing, business rules, and storage in one place with no interface boundary. Every subsequent improvement (unique code generation, real persistence, click tracking, rate limiting) would otherwise require rewriting the same route files again, compounding risk each time. Introducing a layered structure now - domain / application / infrastructure, wired from one composition root - lets each later change swap a single infrastructure piece behind an existing interface instead of touching call sites, and gives the whole project its first real error-handling contract.

## What Changes

- Introduce a **domain** layer: `ShortUrl` entity, domain errors (`InvalidUrlError`, `ShortUrlNotFoundError`, `CodeGenerationError`), and the `UrlRepository` / `CodeGenerator` interfaces. No framework or I/O dependencies.
- Introduce an **application** layer: use cases `shortenUrl`, `resolveAndTrackClick`, `listUrlsWithStats`, depending only on the domain interfaces.
- Introduce an **infrastructure** layer: an `InMemoryUrlRepository` and the existing `generateShortCode` wrapped behind the `CodeGenerator` interface (both still the current, flawed implementations - replacing them is out of scope here), plus the HTTP controllers/routes and a centralized error-handling middleware.
- Add a **composition root** that wires concrete infrastructure into the use cases, replacing the route files' direct imports of `shortenedUrls` / `generateShortCode`.
- **New capability**: centralized error-handling middleware mapping domain errors to HTTP status codes (400 `InvalidUrlError`, 404 `ShortUrlNotFoundError`, 409 conflict, 429 rate-limit - wired by a later change, 500 unexpected) with a consistent JSON body `{ error: { code, message, details? } }`. Stack traces and other internal details never reach the response body.
- **BREAKING (internal only)**: `@url-shortener/engine`'s current exports (`shortenedUrls`, `generateShortCode`, `baseUrl`) are removed in favor of the new layered exports. No consumer exists outside `applications/web`, so there is no external breaking surface.
- Add characterization tests for the two existing endpoints (`POST /`, `GET /s/:code`) that pin current success-path behavior before the refactor, so the same tests passing afterward is the proof that behavior did not change (other than the new error body shape, which is this change's point).

## Out of Scope

- Fixing the 9-code collision bug - the current generator is wrapped behind `CodeGenerator` as-is (`unique-short-code-generation`).
- Real persistence - `InMemoryUrlRepository` is intentionally kept (`persistent-storage-with-prisma`).
- Click tracking, input validation, rate limiting (`click-tracking-and-abuse-protection`).
- Any visual/UI changes (`frontend-redesign`).

## Capabilities

### New Capabilities

- `error-handling`: the service's HTTP error-response contract - consistent JSON error shape, domain-error-to-status-code mapping, and the guarantee that no internal detail (stack traces, raw exception messages) ever reaches a client response.

### Modified Capabilities

(none - this is the first capability introduced in this project; the current shortening/redirect behavior is deliberately left unspecified and unchanged until later changes make it correct)

## Impact

- Affected code: `libs/engine/src/*` (full restructure into domain/application/infrastructure), `applications/web/app/routes/_index.tsx` and `routes/s.$code.tsx` (become thin controllers calling use cases via the composition root).
- No shape change to existing success responses; error responses gain the new structured body.
- No new runtime dependencies - the error middleware and composition root are plain TypeScript.
- Unlocks changes 2-5 to be additive within the new layers instead of touching route files again.
