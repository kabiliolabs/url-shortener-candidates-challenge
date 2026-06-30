# Submission

## What I Did

The main thing I focused on was replacing the in-memory storage with a real database and cleaning up the architecture so the code is actually maintainable.

**Persistence.** Swapped the global `Map` for PostgreSQL + Prisma. Data survives restarts via a Docker volume, and migrations apply automatically on startup — no manual step needed.

**Layered architecture.** I split the business logic into a separate library (`libs/engine`) with three layers: domain (value objects, errors, repository interface), application (use-cases), and infrastructure (the code generator). The key constraint I enforced was keeping Prisma out of that library entirely — the database adapter lives in the web app's server-only directory so it can never accidentally end up in the client bundle.

**URL validation.** Instead of an open redirect, I validate URLs at creation time: only `http` and `https` are accepted. Anything else — malformed strings, `javascript:` schemes, etc. — gets rejected with a clear error message before a short code is ever generated.

**Collision handling.** Short codes are unique in the database. On a collision the use-case generates a new code and retries, rather than doing anything fancy in the database layer. This keeps the two concerns separate.

**Click stats.** Incremented atomically in a single database update, no read-modify-write race.

**Rate limiting.** Added a simple token-bucket limiter on URL creation (not on redirects — a popular link shouldn't 429 real visitors).

**Tests.** Covered the domain logic — URL validation, code generation, the use-case retry behavior — with unit tests that run entirely in-process, no database needed.

**UI.** Cleaned up the interface with Tailwind, added a `/links` page showing all created links with click counts, and a loading state on form submit.

---

## What I Would Do With More Time

**Integration tests for the database layer** — the unit tests run in-process with a fake repository. I'd add tests that hit a real Postgres instance to cover the collision path and the atomic increment properly.

**E2E tests** — Playwright covering the full flow: submit a URL, follow the short link, verify the redirect, check that the click count updates.

**Distributed rate limiter** — the current limiter is in-memory, so it resets on restart and doesn't work across multiple instances. Redis would be the obvious fix.

**Custom aliases** — let users choose their own short code instead of getting a random one.

**Observability** — structured logging on creation and redirect events, a proper health-check endpoint, maybe basic request duration metrics.

---

## AI Usage

Before writing any code I sketched out the architecture in a planning document: how to split the layers, where the database belongs, what rules to enforce across the boundary. Once that was settled, I worked phase by phase, using AI to generate the implementation and then reviewing it before committing.

Here are the actual prompts I used, roughly as I wrote them:

> **Phase 1 — DB setup.** "Add Postgres and Prisma to the web app and wire it into Docker Compose with a health check. Keep all of it in the web package — don't touch the engine library, don't change any routes yet."

> **Phase 2 — Domain layer.** "Build the domain layer in the engine library: value objects for URL validation (http/https only, reject everything else) and short code, a repository interface, a code generator using nanoid. Two use-cases — one for creating a short URL (generate code, save, retry on collision) and one for resolving. Everything injected. No Prisma, no environment variables in here."

> **Phase 3 — Wiring.** "Wire it all up in the web app: a Prisma adapter that implements the repository interface and translates database errors into domain errors, a composition root connecting use-cases to the real database, updated routes showing user-friendly errors. Rate limiting on URL creation per IP only — do not rate-limit the redirect."

> **Phase 4 — UI.** "Using /frontend-design skill redesign the UI with Tailwind: clean form with inline error feedback and a loading state during submission. Add a /links page listing all created URLs with click counts and navigation between the two pages."

> **Phase 5 — Tests.** "Write Vitest tests for the engine library: URL validation, code generation, use-case happy path, retry behavior on collision, resolving unknown codes. Use an in-memory repository fake — no database, no network."

> **Phase 6 — Docker.** "Update the Dockerfile so migrations run automatically on startup, no manual step. Confirm the Compose setup is right: health check, volume for persistence, environment variables. Update the README with the real commands to get started."

AI got things right most of the time, but I still caught issues along the way - a draft that put config into the wrong layer, a test that imported the real database client, a rate limiter accidentally applied to redirects instead of just creation.

The architectural decisions were mine and were written down before any code was generated. AI helped execute them.

---

## Feedback

The challenge description struck a good balance between freedom and a concrete bar. The intentionally broken starter code was a clever framing it made the problems obvious without spelling out the solutions.

The scope was well-calibrated for a multi-hour take-home: enough depth to show architectural thinking, but tight enough that prioritisation decisions are real.
