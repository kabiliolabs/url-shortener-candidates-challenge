# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# First-time setup
pnpm install                                        # install all workspace deps
cp .env.example .env                                # copy env file
cd applications/web && node_modules/.bin/prisma generate  # generate Prisma client
cd applications/web && pnpm db:push                 # create/sync SQLite DB

# Development
pnpm dev              # start all packages (Turbo parallel)

# Build & typecheck
pnpm build            # compile everything (includes prisma generate for web)
pnpm typecheck        # tsc --noEmit across all packages

# Tests (engine only — no web tests exist)
pnpm test                                           # run all tests via Turbo
cd libs/engine && pnpm test                         # run engine tests only
cd libs/engine && pnpm exec vitest run src/domain/value-objects/short-code.test.ts  # single file
cd libs/engine && pnpm test:watch                   # watch mode

# Prisma (run from applications/web/)
pnpm db:push                                        # sync schema → DB (dev, no migrations)
pnpm db:studio                                      # open Prisma Studio UI
node_modules/.bin/prisma generate                   # regenerate client after schema changes
node_modules/.bin/prisma migrate dev --name <name>  # create a named migration
```

`PUBLIC_URL` in `.env` sets the base URL for shortened links. `DATABASE_URL` is a SQLite file path relative to `applications/web/` (e.g. `file:./dev.db`).

## Architecture

This is a **pnpm + Turbo monorepo** with two packages:

- **`libs/engine`** — pure TypeScript domain logic, no framework dependency
- **`applications/web`** — React Router v7 SSR app that consumes the engine

### Engine (`libs/engine/src/`) — Clean Architecture layers

```
domain/
  value-objects/   ShortCode (validates 7-char a-z0-9), LongUrl (validates http/https)
  entities/        ShortenedUrl (ShortCode + LongUrl)
  repositories/    IUrlRepository (interface: save / findByCode / existsByCode — async)
  services/        IShortCodeGenerator (interface: generate → ShortCode)
application/
  use-cases/       ShortenUrlUseCase, ResolveUrlUseCase
                   ↑ collision-retry logic lives here (up to 10 attempts), not in the generator
infrastructure/
  repositories/    InMemoryUrlRepository (implements IUrlRepository)
  services/        RandomShortCodeGenerator (implements IShortCodeGenerator)
```

**Dependency rule:** domain ← application ← infrastructure. Value objects throw on invalid construction (no factory methods). The repository interface is `Promise`-based to be database-ready.

### Web app (`applications/web/app/`)

- **`server/container.ts`** — module-scope singleton that wires dependencies. **Both routes must import from here** (split-instance bug otherwise).
- **`server/prisma.ts`** — `PrismaClient` singleton with the global-for-dev pattern (avoids connection exhaustion in dev with HMR).
- **`server/repositories/prisma-url-repository.ts`** — `IUrlRepository` backed by SQLite via Prisma. Imports domain types from `@url-shortener/engine`.
- **`routes/_index.tsx`** — form + `ShortenUrlUseCase` via `action()`
- **`routes/s.$code.tsx`** — redirect via `ResolveUrlUseCase` in `loader()`

### Database

- Schema: `applications/web/prisma/schema.prisma` (SQLite, single `ShortenedUrl` model)
- The `build` script runs `prisma generate` automatically before bundling
- Docker: DB file lives at `/app/data/db.sqlite` on a named volume; the container runs `prisma db push --skip-generate` on startup
- `DATABASE_URL` paths are relative to `applications/web/` (the process working directory); Docker uses an absolute path

The engine is consumed as a workspace package (`@url-shortener/engine`) with Vite configured to not externalize it during SSR (`ssr.noExternal`).
