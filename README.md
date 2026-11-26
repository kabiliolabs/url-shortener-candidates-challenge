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
| [Postgres](https://www.postgresql.org/)       | Database. Data lives in the `pgdata` volume                                                       |
| [Prisma](https://www.prisma.io/)              | ORM and migrations for the `ShortLink` table                                                      |

## Docker Setup

Requires Docker.

```bash
docker compose up --build
```

Open `http://localhost:3000`.

That starts Postgres and the app. On startup the app applies the committed migrations. Data is stored in the named volume `pgdata`.

`docker compose down` stops the containers and keeps the data. `docker compose down -v` deletes the volume.

Postgres is published on `localhost:5432` (user, password and database: `shortener`).

## Local Setup

Requires [pnpm](https://pnpm.io/) 10 and the Postgres service from Compose.

```bash
docker compose up db -d
cp .env.example .env
pnpm install
pnpm --filter web db:generate
DATABASE_URL=postgresql://shortener:shortener@localhost:5432/shortener pnpm --filter web exec prisma migrate deploy
pnpm dev
```

Open `http://localhost:5173`.

## Tests

```bash
pnpm test
```

Design and decisions: see `docs/spec.md` and `docs/decisions.md`.
