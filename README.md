# URL Shortener

Shorten links, redirect them, and count every visit.

## Tech Stack

```
url-shortener/
├── applications/web/    # React Router v7 (SSR) + adapters (Prisma, rate limit)
└── libs/engine/         # Domain + application layer (zero runtime dependencies)
```

| Technology                                    | Description                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [pnpm](https://pnpm.io/)                      | Fast, disk-efficient package manager with built-in monorepo support via workspaces                |
| [Turbo](https://turbo.build/)                 | High-performance build system for monorepos. Runs tasks in parallel and caches results            |
| [React](https://react.dev/)                   | Library for building user interfaces with components                                              |
| [React Router v7](https://reactrouter.com/)   | Full-stack React framework. Handles routing, data loading (loaders), mutations (actions), and SSR |
| [TypeScript](https://www.typescriptlang.org/) | Typed superset of JavaScript for catching errors at compile time                                  |
| [Tailwind CSS](https://tailwindcss.com/)      | Utility-first CSS framework for rapid UI development                                              |
| [Vite](https://vite.dev/)                     | Fast build tool and dev server with hot module replacement                                        |
| [Prisma](https://www.prisma.io/)              | Type-safe ORM, over PostgreSQL. Swapping the engine does not touch the domain                     |
| [PostgreSQL](https://www.postgresql.org/)     | Database. Shared by every instance, so the service scales horizontally                            |
| [Vitest](https://vitest.dev/)                 | Unit test runner for the domain and application layers                                            |

## Architecture

Hexagonal (ports & adapters). The dependency arrows all point inwards:

```
 HTTP (React Router routes)          ← driving adapter
      ↓ uses
 Application  ShortenUrl · ResolveShortenedUrl · ListShortenedUrls
      ↓ depends on
 Domain       ShortenedUrl · DestinationUrl · ShortCode · ShortenedUrlRepository (port)
      ↑ implemented by
 PrismaShortenedUrlRepository        ← driven adapter
```

- `libs/engine` has **no runtime dependencies**: no React, no Prisma, no framework. It is
  testable in milliseconds with an in-memory implementation of the port.
- `applications/web/app/container.server.ts` is the only place where a concrete adapter
  is wired to a use case (composition root).
- Prisma types never leave `app/infrastructure/prisma/`.

## Local Setup

```bash
pnpm install                    # if pnpm is missing: corepack enable
docker compose up -d db         # Postgres on localhost:5433
pnpm --filter web db:migrate    # applies the migrations
pnpm dev
```

Open `http://localhost:5173`

The dev server defaults to the Postgres published by `docker compose up -d db`, so no
`.env` file is needed locally (`cp .env.example .env` if you want to override anything).

### Useful commands

```bash
pnpm test        # unit tests (domain + application)
pnpm typecheck   # TypeScript across the monorepo
pnpm build       # production build
```

## Docker Setup

```bash
docker-compose up --build
```

Open `http://localhost:3000`

Compose starts two services: `db` (PostgreSQL, with a healthcheck) and `web`, which only
boots once the database is healthy. The data lives in the `url-shortener-db` named volume
and migrations run on every boot (`prisma migrate deploy`), so **data survives restarts
and image rebuilds**:

```bash
docker-compose restart          # links and click counters are still there
docker-compose down && docker-compose up --build   # still there
docker-compose down -v          # the only way to wipe the data
```

Notes:
- The web container runs as the non-root `node` user.
- Database credentials are hardcoded in `docker-compose.yml` for the sake of a one-command
  setup. In a real deployment they would come from secrets.
- `PUBLIC_URL` is what short links are built from; `docker-compose.yml` sets it to
  `http://localhost:3000`. In production it must be the real public origin.
