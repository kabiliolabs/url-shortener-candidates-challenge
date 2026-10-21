# CLAUDE.md

Guidance for AI agents (Claude Code) working in this repo.

## Context

URL shortener refactor for a technical challenge (~2h). Requirements: [CHALLENGE_DESCRIPTION.md](./CHALLENGE_DESCRIPTION.md).
What to build: [SPECS.md](./SPECS.md). Why it's built this way: [DECISIONS.md](./DECISIONS.md).

## Commands

pnpm 10.20.0 via Corepack (`corepack enable` once). Never use npm/yarn, never commit `package-lock.json`.

```bash
pnpm install
docker compose up -d db                                  # Postgres on localhost:5434
pnpm --filter @url-shortener/infrastructure db:migrate   # create/apply migrations
pnpm dev                                                 # http://localhost:5173
pnpm typecheck
pnpm test                                                # integration tests need the db running
docker compose up --build                                # http://localhost:3000
```

## Architecture (hexagonal + DDD), see ADR-002

- `libs/engine/src/domain`: entities, value objects, domain errors, ports. Pure TypeScript, no deps.
- `libs/engine/src/application`: use cases. They depend on ports only.
- `libs/infrastructure`: adapters implementing the ports (Prisma, generators, rate limiter).
- `applications/web`: driving adapter. Routes stay thin: parse, call the use case, map the result.
  Wiring lives in `app/.server/container.ts`.

Dependency rule: `web → infrastructure → engine`. `engine` never imports from other packages.

## Workflow

1. Check the spec in `SPECS.md`. If behaviour is missing or ambiguous, update the spec first.
   Keep specs short and plain, written the way a person would write them.
2. Write or adjust tests, grouped by spec (`describe("SPEC-002: Validate the URL")`).
3. Implement.
4. Add or update the ADR in `DECISIONS.md` if a decision was made.
5. Run `pnpm typecheck && pnpm test`, then start the app (`pnpm dev` and `docker compose up --build`)
   and check the block actually works. Every commit must leave the project runnable.
6. One commit per plan block, Conventional Commits, the body explains *why*, footer `Refs: SPEC-00X`.

## Code style

- Everything in the repo is in English (code, comments, docs, commits).
- Comments: short, colloquial, explain *why* rather than *what*. JSDoc on ports, use cases and
  value objects; elsewhere only for non-obvious bits. Don't over-comment.
- Domain errors are typed classes; web maps them to user messages. Never leak stack traces in prod.
- Value objects validate in their factory (`OriginalUrl.create()`); invalid instances can't exist.
