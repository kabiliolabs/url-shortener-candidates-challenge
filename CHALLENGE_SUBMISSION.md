# Submission

## What I Did

I refactored the original monolithic, in-memory URL shortener into a clean, layered architecture following hexagonal / clean architecture principles.

**Architecture**
- Extracted a `libs/engine` package with three layers: domain, application, and port interfaces. The domain holds value objects (`OriginalUrl`, `ShortCode`, `ShortenedUrl`) that encapsulate their own validation; the application layer holds four use cases (`ShortenUrl`, `FindUrlByCode`, `ListUrls`, `TrackClick`); ports (`UrlRepository`, `RateLimiterPort`) keep the domain decoupled from infrastructure.
- Replaced the 9-possibility code generator with a 7-character alphanumeric `ShortCode` (~62⁷ ≈ 3.5 trillion combinations), eliminating practical collision risk. The use case also retries up to 3 times on a short-code unique-constraint violation, making the astronomically-rare collision safe to handle.

**Persistence**
- Replaced in-memory storage with SQLite via Prisma. Added a unique constraint on `originalUrl` so submitting the same URL twice returns the existing short link instead of creating a duplicate.

**Rate limiting**
- Implemented a token-bucket `InMemoryRateLimiter` (per client IP) with automatic bucket eviction to prevent memory growth. Configured at 10 requests per minute by default.

**Frontend**
- Replaced the bare HTML form with a React Router v7 app using shadcn/ui components (Card, Input, Button, Badge). Features: loading state on submit, inline error feedback, copy-to-clipboard button, optimistic click count updates in the URL list.

**Testing**
- Added unit tests for all use cases and the rate limiter (`vitest`). Tests use in-memory stub repositories and a stub rate limiter, keeping them fast and free of I/O.

**What I prioritized and why**
The biggest risks in the original code were collision-prone codes, no persistence, and no separation of concerns — those three made everything else unreliable, so I fixed them first. UI polish and testing came next because they directly reflect production readiness.

## What I Would Do With More Time

- **Redis-backed rate limiter** — the current one resets on restart and doesn't work correctly if the app scales to multiple instances.
- **Persistent click tracking** — server-side tracking works correctly when a short URL (`/s/:code`) is visited directly. The UI list bypasses the redirect route by opening the original URL directly and firing a separate fetcher to `/api/track/:code`; if that client-side request fails, that click is lost. A server-enforced redirect for every access path would make counting fully reliable.
- **Pagination** — the URL list loads all rows; for a real service this needs cursor-based pagination.
- **Auth / ownership** — without authentication there is no way to delete or manage your own links.
- **E2E tests** — Playwright tests covering the happy path and error states would complement the unit tests.

## AI Usage

I used **Claude Code** (Anthropic's CLI agent) throughout the challenge.

Example prompts I gave it:

- *"Refactor the route handler into separate use cases following hexagonal architecture. Extract domain value objects for OriginalUrl and ShortCode."*
- *"Implement a token-bucket rate limiter that works per identifier and evicts stale buckets to avoid memory leaks."*
- *"The shorten use case should return the existing URL if the same original URL was already shortened, instead of creating a duplicate."*
- *"Add unit tests for ShortenUrlUseCase, FindUrlByCodeUseCase, and TrackClickUseCase using in-memory stub repositories."*

I reviewed every generated diff before accepting it, adjusted pieces that didn't match my intent, and wrote the Prisma schema and Docker configuration myself. Claude Code was most useful for scaffolding boilerplate quickly (test stubs, shadcn component wiring) and for catching edge cases I described in plain language.

## Feedback

The challenge is well-scoped — there is a clear starting point, the requirements are unambiguous, and the 2-hour framing forces real prioritization decisions rather than gold-plating. The deliberate flaws in the original code are a good reflection of real-world legacy code.

One suggestion: it would be interesting to include one or two intentional *non-obvious* bugs (e.g., a subtle race condition or an off-by-one in click counting) in addition to the structural issues, since debugging is as much a part of engineering as refactoring.
