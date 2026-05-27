# Submission

## What I Did

I focused the refactor on the main risks of the original implementation: architecture, persistence, validation, UI, tests and Docker reproducibility.

The core shortener logic now lives in `libs/engine` as a pure package. It contains domain rules, use cases and ports. It does not depend on React, Prisma or environment variables.

The web app is responsible for the runtime layer. It connects the engine with React Router routes, Prisma/PostgreSQL persistence, server configuration and UI components.

Local development runs only with Docker, so Node, pnpm and PostgreSQL versions are controlled by the project.

- Added clean short URL use cases for create, resolve and list.
- Added URL and short-code validation.
- Added collision-safe short-code generation.
- Added PostgreSQL persistence through Prisma and a repository adapter.
- Added tests for the important engine flows.
- Reworked React Router routes so they adapt requests and responses instead of owning business logic.
- Replaced the initial UI with reusable components and accessible feedback.
- Added Radix primitives behind local component wrappers.
- Added lightweight abuse-prevention measures.
- Documented the refactor plan and block-by-block decisions in `docs/`.

## What I Would Do With More Time

- Add web-level component and route tests.
- Move the in-memory rate limit to Redis or another shared store for multi-instance deployments.
- Add observability around errors, redirects and rate-limit events.
- Add pagination or filtering for the URL list.
- Improve production deployment documentation with secrets, migrations and health checks.
- Add end-to-end tests covering creation, copy/open actions and redirects.

## AI Usage

I used AI as a pair-programming and planning assistant. The work was split into small documented blocks so each change had a clear scope and could be reviewed independently.

Example prompts:

- "Analyze the project and propose architecture-focused refactor priorities."
- "Continue with the UI cleanup using local Radix-backed components."
- "Add lightweight abuse-prevention measures suitable for this challenge."

AI was also used to draft technical notes after each block. I kept the scope intentionally small and validated changes with Docker-based commands.

Fun note: this challenge only used around 15% of my weekly Codex usage, so there was still plenty of room for more refactors, debates about abstractions, and overengineering.

## Feedback

I liked the challenge. It is clear, practical and open enough to show different skills without requiring a large product.

The hardest part for me was avoiding overengineering. As it is a technical challenge, it is tempting to show more architecture knowledge, CQRS, design patterns or extra abstractions. I tried to balance that with KISS principles, readability and keeping control of the code.

I also think the challenge works well because it has simple product requirements but many possible technical decisions. That makes it useful to discuss tradeoffs, not only code.
