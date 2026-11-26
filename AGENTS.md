# AGENTS.md

## Context
- pnpm + Turbo monorepo: `applications/web` (React Router 7, SSR) and `libs/engine` (logic).
- `web` imports `engine` as source (`exports` points to `src`, Vite bundles it via `ssr.noExternal`). Don't change that mechanism.
- What to build: `docs/spec.md`. Why: `docs/decisions.md`. If something isn't there, ask; don't decide it.

## How to work
- One step of the spec's "Work order" at a time. When it's done, stop and summarize what changed and how to test it.
- Small, reviewable changes; don't touch files outside the step.
- Don't do the spec's "With more time" items (Postgres contract suite, frontend optimization, rate limit) unless asked.
- Dependencies: architecturally, `applications/web` may import any third-party library it needs; in this project the only new dependencies are `prisma`, `@prisma/client` and `vitest`. For any other, ask first.
- Don't change closed decisions (Postgres, 302, dedupe, alphabet, P2002 by target, no env var for scheme-less URLs, counter counts every GET).

## Code rules
- Strict TypeScript, no `any`.
- `libs/engine` imports nothing external (no Prisma, no React Router, no third-party libraries).
- Prisma only in `.server` modules.
- Domain as pure functions; classes only for adapters.
- Routes have no business logic: they parse, call the use case and respond.
- Randomness with `crypto`, never `Math.random`.
- Counter always via `increment` in the database. It counts every GET (bots and unfurlers included); don't try to filter them.

## Verification before calling a step done
- `pnpm build` and `pnpm test` green.
- If the step touches persistence or Docker: `docker compose up --build` from scratch works.
