# URL Shortener

## Tech Stack

```
url-shortener/
├── applications/web/    # React + React Router v7
└── libs/engine/         # Domain logic
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
| [PostgreSQL](https://www.postgresql.org/)     | Relational database. Runs as the `db` service in Docker Compose                                   |
| [Prisma](https://www.prisma.io/)              | ORM and migration tool. Schema and migrations live in `libs/engine/prisma`                        |

## Local Setup

Requires Docker for the database. The app itself runs on the host.

```bash
pnpm install
cp .env.example .env
cp libs/engine/.env.example libs/engine/.env
docker compose up -d db
pnpm --filter @url-shortener/engine db:deploy
pnpm dev
```

Open `http://localhost:5173`

There are two `.env` files because two tools read them: the web app loads the root one, and the Prisma CLI runs from `libs/engine` and loads the one there. Both hold the same `DATABASE_URL`.

| Variable       | Description                                                                 |
| -------------- | --------------------------------------------------------------------------- |
| `PUBLIC_URL`   | Origin used to build short URLs. Port 5173 in development, 3000 in Docker   |
| `DATABASE_URL` | PostgreSQL connection string. The examples match the `db` service's values  |

Database scripts, run with `pnpm --filter @url-shortener/engine <script>`:

| Script        | Description                                                              |
| ------------- | ------------------------------------------------------------------------ |
| `db:migrate`  | Creates a migration from schema changes and applies it (development)     |
| `db:deploy`   | Applies pending migrations without creating new ones                     |
| `db:generate` | Regenerates the Prisma client after a schema change                      |

## Docker Setup

```bash
docker compose up --build
```

Open `http://localhost:3000`

This starts PostgreSQL and the web app. The app waits for the database to be healthy, applies pending migrations and then starts. Data is kept in the `db-data` volume and survives restarts; `docker compose down -v` deletes it.

No `.env` file is needed: the configuration for this mode is in `docker-compose.yml`.
