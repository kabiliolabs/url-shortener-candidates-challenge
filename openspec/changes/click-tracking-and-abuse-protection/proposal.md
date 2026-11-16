# Proposal

## Why

Resolving a short code today redirects without recording anything, so the challenge's "track click statistics" requirement is unmet even after persistence lands. Worse, the redirect target is never validated - any string submitted as a "URL" is stored and later handed straight to a redirect, which is a textbook open-redirect vector - and there is no limit on how fast new short URLs can be minted. This change makes click tracking real, closes the validation gap, and adds the abuse protections the challenge explicitly calls for.

## What Changes

- `GET /s/:code`: redirect with **302**, never 301 - a 301 would let browsers cache the redirect and stop hitting the server on repeat visits, silently undercounting clicks (see `design.md`). Unknown codes respond 404.
- Each successful resolution atomically increments that record's click count (`clicks = clicks + 1` at the database level), avoiding lost updates under concurrent requests to the same code.
- New `GET /api/urls` endpoint returning shortened URLs with their stats (code, original URL, click count, creation date), bounded by pagination/a max page size - never an unbounded full-table dump.
- Input validation on the shorten request: only `http`/`https` schemes, max length 2048, a syntactically valid hostname, and rejection of URLs whose host is this service's own domain (prevents a short URL that redirects back into the shortener, i.e. a redirect loop). The rule itself is a framework-free domain predicate (reusable by `frontend-redesign`); the shorten request's Zod schema is a thin boundary adapter that parses the raw input and delegates the actual check to that predicate.
- Rate limiting on the shorten endpoint: once a client exceeds the configured rate, respond 429 with a `Retry-After` header and a clear error message.
- Security hardening: standard security headers (helmet-equivalent), CORS restricted to the configured frontend origin, and a request body size limit.

## Out of Scope

- The `ShortUrl.clicks` column and its persistence (already added by `persistent-storage-with-prisma`) - this change only adds the behavior that uses it.
- Any UI for the stats list (`frontend-redesign` consumes `GET /api/urls`).
- Per-IP or per-account abuse attribution beyond request-rate limiting (acceptable limitation for this challenge's scope).

## Capabilities

### New Capabilities

- `url-redirection`: resolving a short code - the 302 redirect contract, the atomic click-increment side effect, and the 404 behavior for unknown codes.
- `url-listing`: the `GET /api/urls` contract for retrieving shortened URLs with their statistics, bounded in size.
- `abuse-protection`: the validation rules a submitted URL must satisfy, and the request-level protections (rate limiting, CORS, body size limit) that guard the shorten endpoint from abuse.

### Modified Capabilities

(none)

## Impact

- `applications/web/app/routes/s.$code.tsx`: explicit 302 status, click-increment call, 404 on miss.
- New route: `GET /api/urls` (React Router resource route).
- `libs/engine/src/application`: `resolveAndTrackClick` performs the atomic increment; `listUrlsWithStats` gains pagination/limit.
- `libs/engine/src/domain`: new `assertShortenable(url, ownDomain)` predicate (scheme, length, hostname, self-domain check), framework-free.
- `libs/engine/src/infrastructure`: Zod schema wrapping that predicate for HTTP-boundary parsing of the shorten request.
- `applications/web/app/routes/_index.tsx` action: now runs the Zod validation and is rate-limited.
- New dependencies: a Zod-compatible rate-limiting approach and security-headers middleware compatible with React Router v7's request/response model (chosen in `design.md`).
