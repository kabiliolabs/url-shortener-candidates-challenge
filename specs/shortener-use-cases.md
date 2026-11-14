# Shortener use cases

## Goal

Move shortening and destination lookup into application use cases, keeping HTTP handling in the routes and URL rules in the domain. Continue using the existing in-memory storage; repository abstraction comes later.

## Scope

- Add `ShortenURLUseCase` and `ResolveShortenedURLUseCase` use cases in the engine's application layer.
- Use Zod to validate untrusted application input before invoking domain operations.
- Return expected failures through the existing shared `Result`, `Ok`, and `Err` contract.
- Make the home action and redirect loader delegate to the use cases.
- Add use-case tests and extend the existing route integration tests.
- Group the shortener's domain and application code under `src/modules/url-shortener`, and move the generic result type into `src/shared/types`.

Out of scope: repository interfaces or adapters, database persistence, changing the short-code generator or collision handling, statistics, abuse controls, and frontend redesign or new loading/feedback behavior. This is an incremental architectural step, not a complete ports-and-adapters migration.

## Requirements

### Module organization

- Inside `src/modules/url-shortener`, put `ShortenedURL` directly in `domain/shortened-url.ts`. Keep its HTTP/HTTPS destination policy in the aggregate, and put the generic protocol-neutral `URL` value object in `src/shared/value-objects/url.ts` with colocated tests.
- Put `ShortenURLUseCase` and `ResolveShortenedURLUseCase` in `application/usecases/shorten-url.ts` and `resolve-shortened-url.ts`. Extract their Zod schemas into `application/validations/shorten-url.validation.ts` and `resolve-shortened-url.validation.ts`. Keep tests colocated with the domain objects and use cases; existing behavioral tests exercise the extracted schemas through the use cases.
- Move the existing map and generator together to `src/modules/url-shortener/shortened-url.ts` without changing their behavior. This remains the current storage implementation, not a repository abstraction.
- Put the generic `Result`, `Ok`, and `Err` definitions and tests in `src/shared/types/result.ts` and `result.test.ts`. Keep URL-specific error types inside their owning module.
- Export the use cases with the explicit `UseCase` suffix and update consumers to those names. Preserve the existing domain, result, storage, and configuration exports while updating internal imports. HTTP routes remain in the web application and `PUBLIC_URL` configuration remains outside the shortener domain. Do not create empty layers or duplicate the old files.

### Validation and boundaries

- Use cases accept untrusted application input without depending on `Request`, `FormData`, React Router responses, or other HTTP types. Routes extract the URL field or route code and pass application input onward.
- Use Zod's non-throwing validation at the application boundary. Validate types without coercing numbers, objects, files, or missing values into strings.
- Keep Zod schemas and issue handling outside the domain. Translate expected schema failures into stable application error codes and readable messages; do not expose raw Zod issues to routes or the UI.
- Keep shared `URL.safeParse(input: string)` responsible for general absolute URL parsing and trimmed text, with a read-only `protocol` getter. `ShortenedURL` owns the HTTP/HTTPS allowlist and explicit HTTP syntax rules. Do not add a competing Zod URL-format validator.
- Preserve `URL`, `ShortenedURL`, and the shared `Result` contract. This feature moves the input-type checks from the route into the application boundary established by the use cases; it does not broaden the value object's string-only contract.

### ShortenURLUseCase

- Validate that the destination input is a string containing at least one non-whitespace character. Zod may trim surrounding whitespace before checking for an empty string.
- Missing input (`null` or `undefined`) and empty/whitespace-only strings produce `required`. Other non-string values produce `invalid_url`.
- Pass the validated string to `ShortenedURL.parseDestination`, which delegates to the generic parser and applies the shortener policy while preserving current error codes/messages. Keep generic parser errors separate from shortener-facing errors.
- Only after successful destination validation, call the existing generator, create `ShortenedURL` through its guarded `Result` factory, and save its code and destination string in the existing map. The factory must also enforce policy for direct callers; no public constructor may bypass it.
- Return the created shortened-link data through `Ok`, providing the code needed by the route to construct the public address. Keep `PUBLIC_URL` and `/s/` address construction outside the use case.
- Invalid input must neither generate a short code nor create or overwrite stored data.

### ResolveShortenedURLUseCase

- Validate that the supplied code is a string containing at least one non-whitespace character. Missing, non-string, empty, and whitespace-only codes produce `invalid_code`.
- Use the original supplied string for lookup. Do not trim, change case, restrict characters, or impose the current generator's length or alphabet on accepted codes.
- Return the stored destination through `Ok` when found; otherwise return `not_found`.
- Do not create an HTTP redirect, build a public URL, generate a code, or modify storage.

| Resolution input | Expected result |
| --- | --- |
| Missing input, `null`, `undefined`, a number, or an object | `invalid_code` |
| Empty string or whitespace only | `invalid_code` |
| An existing exact code | Its stored destination |
| A nonblank string with no exact match | `not_found` |
| `" aa "` when only `"aa"` exists | `not_found`; lookup must not trim |

### Storage and HTTP integration

- Reuse the existing `Map<string, string>` and short-code generator. Both use cases must operate on the same application store. Keep tests isolated without introducing a repository abstraction.
- Preserve current code generation and collision behavior, including the existing overwrite behavior. No persistence across restarts is introduced.
- The home action owns request parsing and HTTP response mapping. Preserve HTTP 200 success data `{ shortenedUrl }` and HTTP 400 validation data containing the existing `error` message and stable `code`.
- Preserve the current shortening messages: `URL is required`, `Enter a complete, valid URL starting with http:// or https://.`, and `Only http:// and https:// URLs are supported.`
- The redirect loader maps a resolved destination to the existing HTTP 302 redirect, `not_found` to the existing HTTP 404 `Not Found` response, and `invalid_code` to HTTP 400 with a readable message.
- Keep route registration unchanged. A missing URL path segment that does not match the redirect route still follows the existing router behavior; direct use-case validation does not create a new route.
- Preserve the home loader, metadata, configured public prefix, UI, and result-link behavior. Expected errors are returned as `Result` failures within the application layer; HTTP mapping stays in the routes.

## Acceptance criteria

1. `ShortenURLUseCase` rejects missing, non-string, blank, malformed, and unsupported-protocol input with the agreed error contract, without generation or storage changes. Existing HTTP/HTTPS, localhost, IPv4, and IPv6 acceptance remains unchanged.
2. A successful shortening stores the trimmed destination without canonicalizing it, and the route returns the existing configured shortened-link format and response shape.
3. `ResolveShortenedURLUseCase` satisfies every example in the resolution table and never changes storage. Existing exact codes resolve regardless of the generator's current alphabet or length.
4. Route integration tests observe HTTP 400 for validation errors, HTTP 302 with the unchanged destination for successful resolution, and HTTP 404 `Not Found` for unknown codes. Existing shortening error codes/messages remain unchanged.
5. Use cases contain application orchestration and no HTTP/configuration concerns; domain objects remain independent of Zod. The routes delegate shortening and lookup instead of duplicating their validation and storage logic. Generic URL parsing and results live in shared code; shortener policy stays in the aggregate. Public exports retain the agreed use-case names and expose the generic URL and shortener-specific error types with their respective contracts.
6. Extend the existing Vitest setup with direct use-case tests and real route integration tests. Restore map state and mocks between tests; verify returned results, HTTP responses, and complete storage state on rejected operations. Preserve existing domain and UI coverage.
7. `pnpm test`, `pnpm typecheck`, and `pnpm build` pass. Record any unavailable checks separately. No repository abstraction, database, generator fix, or additional UI behavior is required for completion.
