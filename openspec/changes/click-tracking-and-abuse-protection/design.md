# Design

## Context

Routes are React Router v7 loaders/actions, not an Express app - there is no stable middleware chain to hang CORS/helmet/rate-limiting on (see `refactor-backend-architecture/design.md` for why this project avoids `unstable_middleware`). `persistent-storage-with-prisma` already added the `clicks` column and a `db` service. See `proposal.md` for motivation and the `url-redirection` / `url-listing` / `abuse-protection` specs for the resulting contracts.

## Goals / Non-Goals

**Goals:**
- Accurate click counts under concurrent traffic.
- Reject obviously malicious or malformed submitted URLs before they're ever stored.
- A single, explicit place each protection (rate limit, CORS, body size, validation) is applied, consistent with the shared-function pattern from `refactor-backend-architecture`.

**Non-Goals:**
- Per-user or per-API-key rate limiting (only per-request-origin/IP, see Decisions).
- Distributed rate-limit state across multiple instances (this is a single-instance deployment).
- A denylist of malicious domains beyond the self-domain check - that would require a third-party reputation service, out of scope.

## Decisions

**The URL-acceptance rule lives in domain; Zod is a boundary adapter, not the rule.** The actual rule (scheme/length/hostname/self-domain) is implemented as a framework-free predicate in `libs/engine/src/domain` (e.g. `assertShortenable(url, ownDomain)`, throwing `InvalidUrlError` with a specific reason) - not inside a Zod schema. The shorten action's Zod schema only parses the raw request shape and delegates the actual check to that predicate (e.g. via `.superRefine()`), in `libs/engine/src/infrastructure`. This keeps `domain` free of any framework dependency (per `refactor-backend-architecture`) while still giving the rule exactly one implementation, reusable as-is by `frontend-redesign` without pulling Zod - or any infrastructure code - into domain. Alternative considered: implement the whole rule inside the Zod schema in infrastructure. Rejected: that puts a business rule in the technical layer, the exact layering violation `refactor-backend-architecture` set out to avoid.

**302, never 301, for the redirect.** A 301 ("Moved Permanently") is explicitly a signal browsers are allowed to cache indefinitely; once cached, the browser navigates straight to the original URL on repeat visits without ever contacting the server again, silently undercounting clicks from then on. A 302 ("Found" / temporary redirect) is not cached the same way, so every visit reaches the server and can be counted. React Router's `redirect()` helper already defaults to 302, so this decision is mainly a guard against a future "optimization" to 301 - it is made explicit in code and pinned by a test.

**Atomic increment via the database, not read-then-write.** The resolve use case calls `prisma.shortUrl.update({ where: { code }, data: { clicks: { increment: 1 } } })` rather than reading the current count, adding 1 in application code, and writing it back. The latter has a classic lost-update race: two concurrent requests can both read `clicks = 5` and both write back `6`, losing one increment. An atomic `UPDATE ... SET clicks = clicks + 1` (what Prisma's `increment` compiles to) is race-free regardless of concurrency - this is also why `persistent-storage-with-prisma` chose PostgreSQL over SQLite.

**Rate limiting as an explicit in-memory check, not framework middleware.** Consistent with `refactor-backend-architecture`'s choice to avoid `unstable_middleware`, the shorten action explicitly calls a `checkRateLimit(clientKey)` function (infrastructure layer) before doing any work. It uses a simple in-memory fixed-window counter keyed by client IP. Trade-off: this state is per-process and resets on restart, and would not be shared across multiple instances - acceptable for this single-instance challenge deployment, same simplification already accepted for migrations in `persistent-storage-with-prisma`. A Redis-backed limiter would be the production upgrade path.

**CORS and security headers applied via a shared response helper, not middleware.** A `withSecurityHeaders(response, request)` function (infrastructure layer) sets the CORS and security headers on every `Response` returned by a route, checking the request's `Origin` against the configured frontend origin for CORS. Same rationale as the error-mapping function from `refactor-backend-architecture`: one place owns the policy, call sites stay trivial.

**Body size limit via `Content-Length` check plus a hard read cap.** Reject immediately if `Content-Length` exceeds the configured maximum; since that header can be absent or spoofed, also cap the number of bytes actually read from the request body and abort if exceeded. This avoids depending on an Express-specific body-size-limiting middleware that doesn't apply to React Router's native `Request`/`Response` model.

**Self-domain check uses the same configured base URL already used to build short links,** read from configuration (no hardcoded domain), so the check stays correct if the deployment domain changes.

**Listing uses offset + limit pagination**, not cursor-based, with a default and maximum page size. Simpler to implement and sufficient for this project's scale; cursor pagination would be the upgrade if the table grew large enough for offset scans to matter.

## Risks / Trade-offs

- [The domain predicate and the Zod wrapper could report different rejection reasons if someone edits one without the other] -> Mitigation: the Zod schema's `.superRefine()` surfaces the predicate's own thrown reason as its issue message, so there is one message source, not two independently-maintained copies.
- [In-memory rate limiting resets on restart and isn't shared across instances] -> Mitigation: acceptable for a single-instance deployment; call out as a known limitation, matching the migration-safety note already accepted in `persistent-storage-with-prisma`.
- [A spoofed or absent `Content-Length` could let a client start an oversized upload before the hard read cap kicks in] -> Mitigation: the hard read cap aborts the stream as soon as the limit is crossed, bounding worst-case memory use even without a trustworthy header.
- [Self-domain rejection could have false positives if the configured base URL is wrong in a given environment] -> Mitigation: covered by a test asserting the check reads the same config value used to build short links, so they can't drift independently.
