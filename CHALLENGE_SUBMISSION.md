# Submission

## What I Did

I started with a read-only audit of the starter repository, identifying the main issues: a collision-prone short-code generator with only nine possible codes, in-memory storage, missing URL validation, limited separation of concerns, no tests, and no persistent Docker storage.

I then defined the target architecture with OpenSpec before implementation, keeping the scope aligned with the ~2-hour time limit.

### Main improvements

1. **Persistent and reliable storage**

   Replaced the in-memory `Map` with SQLite and Prisma. The engine is now separated into:

    * `domain/` — entity, validation, errors, repository interface, and code generation.
    * `application/` — `ShortUrlService`.
    * `infrastructure/` — Prisma repository implementation.

   The database `UNIQUE` constraint on `code` is the authoritative uniqueness guarantee, with bounded retry logic for collisions.

2. **URL validation and abuse prevention**

   Added validation that only accepts `http` and `https` URLs and enforces a maximum URL length.

   Added per-IP in-memory rate limiting for link creation. This is intentionally a single-instance solution appropriate for the challenge scope rather than introducing distributed infrastructure such as Redis.

3. **Frontend and UX**

   Added the missing URL listing and click statistics, field-level validation feedback, submission loading states, and reusable UI components using shadcn-style components built on Radix primitives and Tailwind.

   Manual testing also identified and fixed two UX issues: the click counter not updating until a manual refresh, and the URL input not clearing after a successful submission.

4. **Testing**

   Added tests covering the highest-risk areas:

    * URL validation.
    * Short-code collision handling.
    * Prisma repository persistence and uniqueness using SQLite.
    * Route `loader`/`action` behavior for the main flows.
    * Rate limiting.

   The tests focus on the core behavior rather than introducing unnecessary testing infrastructure for a small take-home exercise.

5. **Docker and persistence**

   Added persistent SQLite storage through a Docker named volume and database migrations during container startup.

   The Docker setup was verified end-to-end by building and running the application, creating a short URL, stopping the containers, starting them again without rebuilding, and confirming that the data was still available.

   This process exposed and allowed me to fix two runtime issues related to Prisma/Vite SSR bundling and Node.js module resolution in the monorepo.

### Scope decisions

The implementation was intentionally focused on the core requirements that provide a functional and maintainable URL-shortening service within the challenge time limit.

The following areas were deliberately left for a future iteration:

* Authentication and user accounts.
* Link ownership and authorization.
* Custom/vanity short codes.
* Per-click event history and richer analytics.
* Pagination for larger URL collections.
* Distributed rate limiting.
* CI pipeline.

These are mostly independent extensions of the current architecture rather than requirements that would justify complicating the core implementation during the time-boxed exercise.

## What I Would Do With More Time

The next iteration would focus on making the service suitable for multiple users rather than simply adding more functionality to the existing single-user flow.

### 1. Authentication and link ownership

Introduce user accounts and associate each `ShortUrl` with an owner.

This would allow users to:

* View only their own links.
* Delete or manage their links.
* Access their statistics securely.
* Prevent one user from modifying another user's resources.

Authorization would be enforced at the application/service layer rather than relying only on UI restrictions.

### 2. Custom / vanity short codes

Allow users to optionally choose a custom code, while keeping generated codes as the default.

The existing database uniqueness constraint would remain the source of truth, with validation for format, length, reserved words, and collisions.

### 3. Detailed analytics

Add a `ClickEvent` model to capture information such as timestamp, referrer, and user agent. This would provide the foundation for historical click analytics rather than the current aggregate counter.

### 4. Scalability improvements

For a multi-instance deployment, replace the in-memory rate limiter with a shared store such as Redis and consider moving from SQLite to a server database such as PostgreSQL.

Pagination and more targeted database queries would also become important as the number of stored links grows.

### 5. Additional validation and integration coverage

Add more route-level integration tests through actual HTTP request/response flows, covering authentication, authorization, redirects, validation, and rate limiting once those features exist.

## Technical Validation

The final implementation was verified through automated tests, type checking, manual testing of the main user flows, and an end-to-end Docker persistence test.

In particular, Docker persistence was tested across a full container restart without rebuilding the application, confirming that the SQLite database survives container restarts as intended.
## AI Usage

AI was used as a development assistant throughout the exercise for repository analysis, architecture exploration, implementation, debugging, testing, and review.

I used **Claude Code with Sonnet 5**, together with **OpenSpec, Superpowers, and frontend-design**.

The workflow was structured to keep architectural decisions and implementation under control:

* Started with a read-only repository audit before making code changes.
* Defined and reviewed the target architecture and scope in OpenSpec.
* Implemented the approved change incrementally by task group.
* Used AI for implementation and debugging while reviewing the generated changes against the architecture and challenge requirements.
* Used automated tests, type checking, manual testing, and Docker execution to validate the implementation.
* When AI-generated suggestions were unnecessary or conflicted with the agreed scope, they were reviewed and adjusted rather than applied automatically.

### Examples of AI-assisted tasks

The prompts were structured around a clear **Context → Instruction → Input → Output** format so that the AI had the relevant project constraints before making changes.

#### 1. Repository audit

**Context:**
I have a deliberately flawed URL shortener take-home repository. It uses React Router v7 with SSR, a pnpm/Turbo monorepo, and currently stores shortened URLs in memory.

**Instruction:**
Perform a read-only audit of the repository. Do not modify any files. Identify correctness, architecture, persistence, security, testing, and UX issues against the challenge requirements. Keep the recommendations appropriate for a ~2-hour take-home exercise.

**Input:**
The existing repository, its configuration, routes, `libs/engine`, Docker setup, and challenge requirements.

**Output:**
A structured audit of the current implementation, identified risks, recommended target architecture, priorities, and explicit items that should remain out of scope.

#### 2. OpenSpec architecture

**Context:**
The repository audit identified the need for persistent storage, URL validation, collision-safe short codes, click statistics, tests, and a cleaner separation of concerns. React Router v7 loaders/actions must remain the only server layer.

**Instruction:**
Create an OpenSpec change proposal for the approved refactor. Preserve the existing React Router architecture and keep the implementation proportional to the challenge time limit.

**Input:**
The audit findings, challenge requirements, existing repository structure, and technical constraints.

**Output:**
`proposal.md`, `design.md`, feature specifications, and an implementation task breakdown covering persistence, domain/application/infrastructure layers, routes, UI, rate limiting, testing, Docker, and documentation.

#### 3. Implementation and verification

**Context:**
The OpenSpec change has been reviewed and approved. The project uses Prisma + SQLite, React Router v7 loaders/actions, Tailwind, and Vitest. Domain and application layers must remain independent from Prisma and React Router.

**Instruction:**
Implement the approved change incrementally. Keep routes as thin HTTP adapters, preserve the agreed architecture, and verify each task group before moving to the next one. Do not introduce features outside the approved scope.

**Input:**
The approved OpenSpec change, `CLAUDE.md`, existing repository, and current implementation.

**Output:**
The implementation of the approved architecture, followed by tests, type checking, manual verification, and Docker validation. Issues discovered during verification were investigated and fixed before considering the corresponding task complete.

The important part of the workflow was not only generating code, but using AI iteratively for **analysis → design → implementation → testing → debugging → review**, with the resulting behavior verified in the running application.

## Feedback

The challenge is well suited to a time-boxed implementation when the requirements are prioritized around the core user flow. I found that persistence, uniqueness, validation, and basic UX provided the most value early, while features such as detailed analytics or distributed rate limiting were better treated as explicit follow-up work.

One useful finding during implementation came from validating the Docker setup end-to-end. Running `docker compose up --build` exposed two runtime issues that were not apparent from inspecting the configuration alone: Prisma's runtime module resolution when bundled by Vite SSR, and Node.js ESM resolution across the workspace package boundary.

This reinforced the importance of validating the complete runtime environment rather than relying only on static inspection of the configuration.
