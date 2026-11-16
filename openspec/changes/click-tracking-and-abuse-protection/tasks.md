# Tasks

## 1. Input validation

- [x] 1.1 Add `assertShortenable(url, ownDomain)` as a framework-free predicate in `libs/engine/src/domain` (http/https scheme, max length 2048, valid hostname, not the service's own domain) throwing `InvalidUrlError` with a specific reason, and verify unit tests cover: a valid URL, `javascript:`, `ftp:`, a malformed URL, a self-domain URL, and a too-long URL
- [x] 1.2 Wrap that predicate in a Zod schema (`.superRefine()`) in `libs/engine/src/infrastructure` for HTTP-boundary parsing of the shorten request, and verify a unit test confirms the Zod schema's rejection reasons match the domain predicate's for each case from 1.1
- [x] 1.3 Wire the Zod schema into the shorten action, mapping a failed validation to `InvalidUrlError` (400, via the `error-handling` middleware), and verify an integration test posts an invalid URL and asserts a 400 structured error body

## 2. Redirect and click tracking

- [x] 2.1 Update `resolveAndTrackClick` to perform an atomic `clicks: { increment: 1 }` update through `PrismaUrlRepository`, and verify a unit test with a fake repository asserts the increment is invoked exactly once per resolution
- [x] 2.2 Update `routes/s.$code.tsx` to redirect with an explicit 302 and respond 404 (via `ShortUrlNotFoundError`) for unknown codes, and verify an integration test: shorten a URL, resolve it, assert a 302 response and the stored click count increased by 1, and assert an unknown code returns 404
- [x] 2.3 Add a concurrency test issuing N simultaneous resolutions of the same code and verify the final click count equals N, confirming the increment is race-free

## 3. Listing endpoint

- [x] 3.1 Implement `GET /api/urls` (React Router resource route) calling `listUrlsWithStats` with a `limit`/`offset` query, defaulted and capped at a maximum page size, and verify an integration test asserts the response includes code, original URL, click count, and creation date, bounded by the page size
- [x] 3.2 Verify a test asserts an empty list (not an error) is returned when no URLs exist

## 4. Abuse protection

- [x] 4.1 Implement an in-memory fixed-window rate limiter and call it explicitly at the top of the shorten action, and verify an integration test exceeds the configured limit and asserts a 429 response with a `Retry-After` header and a clear message
- [x] 4.2 Implement `withSecurityHeaders` applying CORS (restricted to the configured frontend origin) and standard security headers to every route response, and verify a test asserts CORS headers are present for the allowed origin and absent for a disallowed one
- [x] 4.3 Implement the request body size limit (`Content-Length` check plus a hard read cap) on the shorten action, and verify a test asserts an oversized body is rejected without its contents being processed

## 5. End-to-end verification

- [x] 5.1 Run the full test suite and `docker compose up --build`, and verify through the running app: shortening a URL, visiting its short link (click count increments), requesting an unknown code (404), exceeding the rate limit (429), and listing URLs with stats
