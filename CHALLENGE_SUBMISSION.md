# Submission

## What I Did

I prioritized **architecture, correctness and running on Docker**, then a simple UI that covers the required features. The commit history is ordered so each step can be reviewed on its own (domain → application → infrastructure → web → Docker → docs).

### Architecture

Hexagonal architecture with DDD inside `libs/engine`; the web app is just an adapter.

```
web (routes, UI) → application (use cases, ports) → domain (model)
                         ↑
              infrastructure (Prisma, crypto, clock, logger)
```

- **Domain** — `ShortLink` (aggregate: code, destination, createdAt), `ShortCode` and `DestinationUrl` value objects, `Click` as an append-only record. Click counts are **not** state of the aggregate: they are computed from `Click` rows, so recording a click never contends on a shared counter.
- **Application** — three use cases: `ShortenUrl`, `ResolveShortLink`, `ListShortLinks`. Ports for repositories, code generator, clock, logger and a read-model query for statistics.
- **Infrastructure** — Prisma repositories, a `crypto.randomInt` code generator, system clock and a JSON logger.
- **Web** — a server-only composition root (`app/.server/container.ts`) wires adapters into use cases. Routes translate HTTP ↔ use cases and map engine errors to responses (`ShortLinkNotFoundError` → 404, validation errors → 400 with a message).

### Key decisions

- **Unique codes** — 7 characters, base62 (~3.5 trillion combinations) from a cryptographic RNG. Uniqueness is guaranteed by the primary key, not by checking first: the use case retries on a unique-constraint violation (up to 5 attempts), which is race-free.
- **Redirects never fail because of analytics** — if recording a click fails, the redirect still happens and the error is logged. A lost click is acceptable; a broken link is not.
- **Validation in the domain and use cases** — value objects only accept `http`/`https` destinations with a public domain name (no single-label hosts like `localhost`, no IP literals) up to 2048 characters, and `ShortenUrl` rejects links pointing back to the shortener (prevents redirect loops). The redirect route rejects oversized codes and control characters before touching the database; unknown codes return 404.
- **Persistence** — PostgreSQL + Prisma 7 with versioned migrations and indexes on `short_links.created_at` (listing) and `clicks.short_code` (counting).
- **Stats on their own route** — `/links` loads fresh counts on every visit instead of a list on the home page that goes stale as clicks happen elsewhere.
- **UI** — small hand-written primitives (button, input, card, table) in a shadcn style instead of the shadcn CLI, to avoid extra dependencies for four components. `useFetcher` gives loading state, inline error feedback and automatic revalidation.
- **Docker** — multi-stage build on Node 22 LTS, non-root user, `tini` as PID 1 for graceful shutdown, migrations applied on startup, `web` waits for the database healthcheck.

### Testing

Strict TDD on the engine.

- **Unit tests** (116) cover value objects, the aggregate, use cases (collision retries, click-failure degradation) and adapters.
- **Integration tests** (12) run the Prisma repositories against a real, separate Postgres database.

## What I Would Do With More Time

- **Rate limiting** on link creation and redirects (per IP). Validation stops bad input, but not volume. With multiple replicas the counters need a shared store (Redis), and the client IP must come from a trusted proxy header.
- **Migrations as a separate deploy step** (job or init container) instead of on startup, and a production image without devDependencies.
- **Pagination** on `/links` (currently capped at 100, newest first) and richer stats (clicks over time, last click).
- **E2E tests** for the web flows (Playwright) and component tests for the form.
- **Restart policy and healthcheck** for the `web` service.
- **Cache hot redirects** (in memory or Redis) and record clicks asynchronously if traffic grows.

## AI Usage

I used **Claude Code** as a pair programmer, with me leading the design and reviewing every step. The workflow:

- **Design first, code second.** I defined the ubiquitous language and layer boundaries with the agent before writing code, and challenged its proposals (e.g. where errors belong, whether a "not found" is a domain or application concern).
- **TDD in small commits.** Each commit was one reviewable unit: failing test, implementation, then I reviewed the diff and the proposed commit message before committing. I removed rationale comments from the code and moved the reasoning into commit messages.
- **Sub-agents for bounded tasks.** UI implementation was delegated to a sub-agent with explicit constraints (no new dependencies, sober design, accessibility), then reviewed by the main session. It flagged a stale-result bug that turned out not to exist, which I verified against the code before dismissing.
- **Verification over trust.** Every claim was checked by running it: Docker was tested from a fresh clone with a no-cache build, and the README commands were executed one by one.

Example prompts (translated from Spanish):

- *"Are we adding the necessary indexes?"*
- *"Can this scale horizontally this way?"*
- *"Is this also good for production?"* → led to hardening the Docker image (non-root, Node 22, graceful shutdown).
- *"It would be better if the stats list weren't always shown, otherwise the counter gets stale."* → led to the dedicated `/links` route.

## Feedback

Nice challenge. It really simulates day-to-day work and shows how people behave and get things done. Starting from a flawed codebase, with a time limit and open-ended requirements, makes prioritization and judgment part of the evaluation.