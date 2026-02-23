# Submission

## What I Did

I prioritized correctness, architecture, and production-readiness over feature breadth.

- Replaced the original tightly coupled/in-memory approach with a **DDD + Hexagonal Architecture** split:
	- **Domain layer:** value objects (`OriginalUrl`, `ShortCode`) and domain-safe invariants.
	- **Application layer:** explicit use cases (`createShortLink`, `resolveShortLink`, `listShortLinks`) and ports.
	- **Infrastructure layer:** adapters for Prisma persistence, NanoID generation, and rate limiting.
- Implemented **persistent storage** with Prisma + SQLite (`libs/engine/prisma/schema.prisma`) and a repository adapter to keep data access behind a port.
- Fixed the collision-prone short code generator by using **7-char URL-safe IDs** plus retry-on-collision logic.
- Added **click analytics** (increment click count + update `lastVisitedAt`) on successful resolution.
- Added **abuse protection** via fixed-window IP rate limiting for short-link creation.
- Refactored frontend into a clean, consistent UX with:
	- form validation feedback,
	- loading state during creation,
	- clear success/error messaging,
	- listing table with URL stats.
- Extracted reusable UI primitives (`Card`, `Input`, `Button`, `Alert`) to avoid duplicated styling and improve maintainability.
- Updated Docker setup for a persistent named volume (`url_shortener_data`) and verified data survives container restarts.
- Added focused tests with Vitest for core behavior:
	- create flow (collision retry + rate-limit handling),
	- resolve flow (lookup + click increment),
	- list flow (mapping + limit normalization).

## Architecture Decisions

- **Hexagonal boundary:** routes/controllers depend on use cases; use cases depend on ports; only adapters depend on frameworks/ORM.
- **SOLID alignment:**
	- Single Responsibility: each use case has one reason to change.
	- Open/Closed + Dependency Inversion: behavior extended via ports/adapters without changing core use cases.
	- Interface Segregation: small ports (`ShortLinkRepositoryPort`, `AbuseProtectionPort`, `IdGeneratorPort`).
- **Validation strategy:** domain value objects protect business invariants; application-level parsing provides user-facing error semantics.
- **Trade-off:** used SQLite for fast setup and Docker portability; design remains adapter-friendly for Postgres/MySQL later.

## Verification

- Local checks executed:
	- `corepack pnpm --filter @url-shortener/engine typecheck`
	- `corepack pnpm --filter @url-shortener/engine test`
	- `corepack pnpm --filter web typecheck`
	- `corepack pnpm --filter web build`
- Docker checks executed:
	- `docker compose up --build -d`
	- Verified `GET /` returns 200
	- Verified create flow via `POST /?index`
	- Verified redirect via `/s/:code` returns 302
	- Restarted container and confirmed persisted data still available

## What I Would Do With More Time

- Add integration/e2e tests for full user journeys (create -> redirect -> stats update).
- Introduce auth and multi-tenant ownership for URLs.
- Add optional custom aliases, reserved keywords, and profanity/domain abuse filters.
- Move rate-limiting counters to shared storage (Redis) for multi-instance deployments.
- Add observability stack (structured logs, metrics, tracing, dashboards).
- Add CI pipeline with lint/typecheck/test/build gates and migration checks.
- Replace `prisma db push` in production with migration-driven rollout.

## AI Usage

I used AI as an implementation copilot for architecture decisions, refactoring, and validation workflows. I reviewed and adjusted generated output before applying it.

### Example prompts I used

1. **Prompt:**
	"Scan the monorepo and identify the biggest architectural issues against SOLID, DDD, and hexagonal architecture."
	**AI Response (summary):**
	It identified tight coupling between UI and business logic, in-memory storage, weak code generation, and missing validation/error boundaries, then proposed a ports-and-adapters decomposition.

2. **Prompt:**
	"Refactor `libs/engine` into domain/application/infrastructure layers and expose use cases via a composition root."
	**AI Response (summary):**
	It generated value objects, typed errors, repository and service ports, and use cases for create/resolve/list, plus infrastructure adapters.

3. **Prompt:**
	"Add Prisma + SQLite persistence and make it work in Docker with data surviving restarts."
	**AI Response (summary):**
	It added Prisma schema/scripts, Docker updates, and volume-backed database path configuration.

4. **Prompt:**
	"Rewrite the frontend to a modern but minimal UI with loading and error states and URL statistics table."
	**AI Response (summary):**
	It replaced the intentionally poor UI with a clean layout and wired it to the use cases.

5. **Prompt:**
	"Add focused tests for the most important behavior first."
	**AI Response (summary):**
	It proposed a test-first priority on create/resolve/list use cases and generated baseline tests that I refined.

6. **Prompt:**
	"Run Docker end-to-end checks and fix any runtime issues until startup + redirect flow works."
	**AI Response (summary):**
	It detected Prisma SSR runtime issues in container startup, then iterated on configuration/import strategy until Docker runtime was stable.

## Feedback

- Great challenge design with realistic trade-offs and clear room to demonstrate engineering judgment.
- The intentionally flawed baseline is excellent for showcasing architecture and refactoring skills.
- Timebox encourages prioritization, which is valuable for assessing seniority.
- Suggestion: add explicit weighting rubric (architecture, UX, tests, ops) so candidates can align effort to evaluation criteria.
