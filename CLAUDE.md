# CLAUDE.md

URL shortener: pnpm + Turbo monorepo. `libs/engine` is the hexagonal core; `applications/web` is a React Router v7 adapter. Decisions and their rationale live in `docs/adr/` — read the relevant ADR before changing a design, and add a new ADR when making a new one.

## Commands

```bash
docker compose up --build                       # full stack on :3000
docker compose up -d db                         # Postgres only, for local dev and integration tests
pnpm dev                                        # web on :5173 (needs .env and migrated db)
pnpm test                                       # unit tests (no database)
pnpm test:integration                           # Prisma adapters against url_shortener_test
pnpm typecheck
pnpm --filter @url-shortener/engine db:deploy   # apply migrations
pnpm --filter @url-shortener/engine db:migrate  # create a migration after editing schema.prisma
```

## Architecture rules

- Dependencies point inward: `web → application → domain`; `infrastructure` implements ports. Never import `infrastructure` or Prisma types from `domain`/`application`.
- The web app imports the engine only through `@url-shortener/engine/{domain,application,infrastructure}`, and only `app/.server/container.ts` instantiates infrastructure.
- Routes call use cases and translate errors to HTTP; no business logic in routes or components.
- Server-only code lives in `app/.server/` so it never reaches the client bundle.
- Domain objects: `static create(...)` validates new input (`Click.record` for clicks); the public constructor is for trusted data (e.g. rows from the database) and does not validate. No `restore` factories.
- Errors: `DomainError` for broken model rules, `ApplicationError` for use-case outcomes (see ADR 0005).
- Click counts are computed from `Click` rows, never stored on `ShortLink` (ADR 0003).

## Conventions

- Strict TDD on the engine: write the failing test first. Unit tests sit next to the code (`*.test.ts`); database tests are `*.integration.test.ts`.
- Comment only non-obvious decisions (e.g. security rules, edge cases). Broader reasoning goes in commit messages or ADRs.
- Conventional commits, one reviewable unit per commit, body explains the reasoning.
- Do not push or open PRs unless explicitly asked.
- Code, UI copy and docs in English.

## Gotchas

- Prisma 7: the datasource URL lives in `libs/engine/prisma.config.ts` (`process.env.DATABASE_URL`), not in `schema.prisma`. The generated client is gitignored; Turbo generates it before `dev`/`build`/`typecheck`/`test`.
- Prisma 7 with `@prisma/adapter-pg`: a duplicate key is `P2002`, but `meta.target` is missing. The constraint is under `meta.driverAdapterError.cause`.
- Vite does not load non-`VITE_` variables into `process.env`; `applications/web/vite.config.ts` loads the root `.env` explicitly.
- `db/init-test-db.sql` only runs when the `db` volume is first created. If `url_shortener_test` is missing: `docker compose down -v && docker compose up -d db` (deletes local data).
- The Docker image runs as `node` without pnpm/corepack at runtime; call binaries from `node_modules/.bin`.
