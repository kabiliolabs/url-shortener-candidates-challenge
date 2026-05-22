# URL Shortener

## Tech Stack

```
url-shortener/
├── applications/web/   # React + React Router v7 (SSR)
└── libs/engine/        # Hexagonal/DDD core: domain · application · infrastructure
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
| [Prisma](https://www.prisma.io/)              | Type-safe ORM and migrations against PostgreSQL                                                   |
| [PostgreSQL](https://www.postgresql.org/)     | Source of truth for shortened URLs and click counters                                             |
| [Redis](https://redis.io/)                    | Per-IP rate limiting + hot-redirect cache                                                         |
| [Vitest](https://vitest.dev/)                 | Unit tests for the engine's domain and use-cases                                                  |

## Local Setup

The fast path uses Docker for Postgres + Redis and runs the web on the host with Vite HMR.

```bash
pnpm install
cp .env.example .env
docker-compose up db redis migrate -d
pnpm dev
```

Open `http://localhost:5173`.

Your `.env` (copied from `.env.example`) should reflect those host ports:

```env
PUBLIC_URL=http://localhost:5173
DATABASE_URL=postgresql://app:app@localhost:5432/shortener
REDIS_URL=redis://localhost:6379
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW_SEC=60
CACHE_TTL_SEC=3600
```

Run engine tests with `pnpm --filter @url-shortener/engine test`.

## Docker Setup

Builds and runs the full stack (web + postgres + redis). Postgres data persists in a named volume so URLs and click counts survive restarts.

```bash
docker-compose up --build
```

Open `http://localhost:3000`.

The web container runs `prisma migrate deploy` before serving traffic, so the schema is created (or upgraded) automatically on startup.
