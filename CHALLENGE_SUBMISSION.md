# Submission

## What I Did

I prioritized high-risk backend issues first (collision-prone IDs, in-memory data loss, missing validation), then improved frontend usability and code structure.

### 1) Initial analysis and priorities

Main architectural flaws identified:

- Domain/business logic lived inside route handlers.
- In-memory `Map` storage caused total data loss on restart.
- ID space had only 9 combinations (`abc`, length 2), creating severe collision risk.
- No proper input validation and weak error handling.
- No click analytics persistence.
- UI was intentionally inconsistent and non-reusable.

What I fixed first:

1. Code generation and persistence safety
2. Architecture and separation of concerns
3. Validation + structured errors + basic anti-abuse protection
4. Stats tracking and cleaner UI
5. Tests for critical use cases

### 2) Backend redesign (clean layered architecture)

- Created a layered `engine` architecture:
	- Domain layer:
		- Entity: `ShortUrl`
		- Value Objects: `OriginalUrl`, `ShortCode`
		- Repository and generator interfaces
	- Application layer:
		- `CreateShortUrlUseCase`
		- `RedirectToOriginalUrlUseCase`
		- `TrackClickUseCase`
		- `GetUrlStatsUseCase`
		- `AppError` for typed/structured errors
	- Infrastructure layer:
		- `NanoIdShortCodeGenerator` strategy

- Applied key patterns:
	- Strategy: pluggable short-code generation.
	- Repository: persistence abstraction.
	- Adapter: Prisma repository implementation.
	- Dependency Injection: web container wires concrete implementations to use cases.

### 3) Persistence and concurrency safety

- Added Prisma + SQLite in `applications/web/prisma/schema.prisma`.
- Created `ShortUrl` table with unique constraint on `shortCode`.
- Collision handling is safe for concurrency:
	- DB uniqueness is authoritative.
	- On unique violation, create use case retries with a new generated code.
- Click tracking uses atomic `increment` update in Prisma.

### 4) Frontend refactor and UX improvements

- Refactored into feature-based structure:
	- `features/url-shortener` (components + hooks + server adapters)
	- `features/url-stats` (stats table)
- Added reusable components:
	- URL form with loading and validation feedback
	- Result card with copy-to-clipboard
	- Stats table listing recent links and click counts
- Reworked the page styling into a cleaner modern layout and typography.

### 5) Validation, error handling, security

- Added request payload validation (`zod`) in route action.
- Added domain-level URL and short-code validation.
- Added structured error responses (`AppError` with code + status).
- Added basic fixed-window rate limiter keyed by client IP headers.

### 6) Testing

- Added unit tests in `libs/engine/tests` for:
	- URL creation flow with collision retry behavior
	- Redirect + click tracking behavior
- Ran type checking and tests after refactor.

### 7) DevOps / runtime adjustments

- Docker now passes `DATABASE_URL`.
- App start command runs `prisma migrate deploy` before server start.
- Added environment examples for web package.
- Updated README with architecture and setup instructions.

## What I Would Do With More Time

1. Add integration tests for route loaders/actions and repository adapter against a test DB.
2. Add dedicated analytics/event table (per-click metadata: user-agent, referrer, timestamp) instead of only aggregate fields.
3. Introduce API-first endpoints and explicit DTO contracts for clearer client/server boundaries.
4. Add observability (request logs, error metrics) and tracing.
5. Harden rate limiting with distributed storage (Redis) for multi-instance deployments.
6. Add optional custom aliases and expiration policies.
7. Add stricter URL allow/deny rules and optional safe-browsing checks.

## AI Usage

I used AI as an implementation accelerator while making architecture and prioritization decisions myself.

How AI was used:

- Codebase analysis support for identifying SOLID and layering violations.
- Scaffolding layered TypeScript modules.
- Generating initial test scaffolds and iterating based on typecheck/build feedback.
- Assisting with README/submission documentation structure.

