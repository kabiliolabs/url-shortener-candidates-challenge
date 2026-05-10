# Submission

## What I Did

Comprehensive refactoring across 10 implementation phases:

1. **Package Audit** — Upgraded to Node 22, React Router 7.15, Vite 7, Tailwind 4
2. **Application Reshaping** — Restructured monorepo, extracted `infra/database` package, removed broken `libs/engine/`
3. **Database Introduction** — Prisma 7 (PostgreSQL) + ioredis (Redis) with repository pattern, Docker infrastructure
4. **Logging & Testing** — pino structured logging, Vitest 4.x test infrastructure, middleware pipeline
5. **Short Code Generation** — nanoid-based 10-char base62 codes with collision retry, URL service layer
6. **Caching & Rate Limiting** — Redis cache-first redirects, rate limiting (Redis + in-memory fallback), reCAPTCHA v3
7. **Frontend Rearchitecture** — DaisyUI v5 component library, extracted client services, Storybook 10
8. **UI Redesign** — ShortenForm, UrlTable with sparklines, stats page with recharts, accessibility improvements
9. **Principal Engineer Review** — Fixed 3 critical, 8 high, and 8 medium findings (security, resilience, infra)
10. **PR Code Review** — Final validation, all 92 tests passing

Priority was correctness and security first (proper error handling, rate limiting, input validation),
then developer experience (TypeScript strictness, testing, structured logging),
then user experience (DaisyUI redesign, charts, accessibility).

## What I Would Do With More Time

- admin dashboard for URL management (deletion, custom short codes, expiration, advanced stats)
- integration tests for the full stack (currently only unit tests with mocks)
- A better architecture for the monorepo structure
- a more refined UI. This design is more professional but in a short period, I couldnt develop
  a brand identity for it.

## AI Usage

<!-- How did you use AI tools (if any)? Include some example prompts if you used any agent. -->

## Feedback

<!-- Any feedback on the challenge? Was it clear? Too easy/hard? Suggestions? -->
