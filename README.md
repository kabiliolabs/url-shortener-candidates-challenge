# URL Shortener

## Tech Stack

```
url-shortener/
├── applications/web/    # React Router v7 app: routes, Prisma adapter, composition root
│   └── prisma/          # Schema and migrations
└── libs/engine/         # Domain logic and use cases (no I/O), unit-tested
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
| [PostgreSQL](https://www.postgresql.org/)     | Relational database storing links and click stats                                                 |
| [Prisma 7](https://www.prisma.io/)            | ORM and migrations, using the `pg` driver adapter                                                 |
| [Vitest](https://vitest.dev/)                 | Unit tests for the engine                                                                         |

## Local Setup

Requirements: Node.js 22+, pnpm 10 (`corepack enable`, or `npx pnpm@10.20.0 …`), and Docker for Postgres.

```bash
pnpm install
cp .env.example .env
docker compose up -d db          # Postgres on localhost:5432
pnpm --filter web db:migrate     # apply migrations
pnpm dev
```

Open `http://localhost:5173`. The stats page is at `/urls`.

## Docker Setup

```bash
docker compose up --build
```

Open `http://localhost:3000`. This starts Postgres and the app, and the app applies database migrations before it starts. Data is kept in the `pgdata` volume across restarts. To start from an empty database, run `docker compose down -v`.

## Environment Variables

| Variable       | Required | Description                                                                                  |
| -------------- | -------- | -------------------------------------------------------------------------------------------- |
| `PUBLIC_URL`   | yes      | Public base URL used to build short links (`http://localhost:5173` in dev, `:3000` in Docker) |
| `DATABASE_URL` | yes      | Postgres connection string                                                                   |

The app refuses to start if a required variable is missing. `docker-compose.yml` also reads `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` and `POSTGRES_PORT`, which default to `postgres` / `postgres` / `url_shortener` / `5432`.

## Scripts

| Command                        | Description                                  |
| ------------------------------ | -------------------------------------------- |
| `pnpm dev`                     | Start the dev server                         |
| `pnpm build`                   | Production build (includes `prisma generate`) |
| `pnpm typecheck`               | Type-check all packages                      |
| `pnpm test`                    | Run unit tests                               |
| `pnpm --filter web db:migrate` | Create/apply migrations in development       |
| `pnpm --filter web db:deploy`  | Apply existing migrations (production)       |
