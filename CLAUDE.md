# Project rules

URL shortener take-home challenge (~2 hour time box). See `openspec/changes/url-shortener-core-refactor/` for the approved architecture and scope; OpenSpec is the source of truth when requirements or architectural decisions are unclear.

## Stack (do not change without a compelling reason)

React, React Router v7 (framework/SSR mode — `loader`/`action` are the only server layer, no Express/Fastify/other backend framework), Vite, Tailwind, TypeScript, pnpm, Turbo.

## `libs/engine` layering

* `domain/` — entity (`ShortUrl`), error types, `IShortUrlRepository` interface, URL validator, code-generation policy. **Zero imports** of `@prisma/client`, `react-router`, or `process.env`.
* `application/` — `ShortUrlService`, orchestrates domain + repository. Same zero-import rule as domain.
* `infrastructure/` — `PrismaShortUrlRepository` is the **only** file allowed to import `@prisma/client`. The repository interface itself must stay Prisma-agnostic.
* Route loaders/actions in `applications/web` are thin HTTP adapters: parse input → call `ShortUrlService` → map thrown domain/application errors to `Response`/redirect/field-error shapes. No business logic in routes, no direct Prisma/repository access from routes.
* This layering is the SOLID mapping the challenge asks for (SRP per file, OCP via new repository/validator implementations, LSP via swappable `IShortUrlRepository` implementations, ISP via the four-method repository interface, DIP via constructor-injected abstractions) — see `design.md` decision 10 for the explicit breakdown. Don't collapse layers even if it looks like less code; that mapping is part of what's being evaluated.

## Configuration

`PUBLIC_URL`/`baseUrl` and any other runtime/env config is read at the web/route layer and passed into the service as a plain argument. Domain and application code never read `process.env`.

## Persistence & correctness

* SQLite via Prisma, file-backed, persisted via a Docker volume — not Postgres, not a hand-rolled store.
* The database `UNIQUE` constraint on `code` is the **authoritative** uniqueness guarantee. In-app retry-on-collision is a UX/perf convenience only, never assumed to be sufficient on its own.
* Click stats at P0 = `clickCount` + `lastClickedAt` on the row. No per-click event log (that's explicitly deferred).

## Explicitly out of scope

No microservices, no Redis, no authentication/authorization, no Postgres, no CQRS/event sourcing, no analytics dashboards, no custom/vanity codes, no CI pipeline.

Reusable UI components use shadcn/ui (Radix primitives + Tailwind), restyled with this project's own theme tokens — not shadcn's default look. See `design.md` decision 9.

Rate limiting is in-memory/per-IP/single-instance only — do not build a distributed limiter.

## Working on this repo

* Keep scope proportional to the 2-hour challenge. Do not implement deferred P1/P2 items unless explicitly asked.
* Prioritize the highest-value tests; don't build test infrastructure beyond what's needed to verify the approved scope.
* Verify Prisma/pnpm lifecycle-script behavior actually works in this monorepo rather than assuming it — pnpm restricts postinstall build scripts by default.
* Use **Superpowers** for implementation, testing, and review where appropriate.
* Use **frontend-design** for the frontend UI work.
* `pnpm lint` (`turbo lint`) runs ESLint 9 flat config from the single root `eslint.config.js` — no per-package config files. React/hooks/jsx-a11y rules are scoped to `applications/web/**` only; `libs/engine` gets base JS/TS rules only, since it has no React code.
