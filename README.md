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

## Local Setup

```bash
pnpm install
cp .env.example .env
docker compose up -d db
pnpm dev
```

Open `http://localhost:5173`

## Unit Tests

```bash
pnpm --filter @url-shortener/engine test
pnpm --filter @url-shortener/engine typecheck
pnpm --filter web test
```

## Docker Setup

```bash
docker compose up --build -d
```

This starts the web application and PostgreSQL. The database data is stored in a
named Docker volume and survives container restarts. Open `http://localhost:3000`.
The public `/urls` page lists destinations, short links, creation times, and
successful redirect counts. Search accepts valid HTTP(S) URLs and matches
destinations case-insensitively; the list is paginated with 20 entries per page.
Counts represent requests, not unique visitors.
URL creation is limited to 10 attempts per client IP per minute. Requests over
the limit receive HTTP 429 and a `Retry-After` header. The limit is held in
memory, so it resets when the web process restarts and is intended for a single
web instance. The server uses the direct connection address and does not trust
forwarded-IP headers; a deployment behind a proxy must configure trusted client
IP handling before relying on per-client limits.
PostgreSQL is published on `localhost:5433` by default; change `POSTGRES_PORT`
in `.env` if that port is also unavailable. For local `pnpm dev`, set
`DATABASE_URL` in `.env` to use the same host port.

Docker stores logs for the web and database services using its `local` logging
driver, rotating at 10 MB per file and keeping up to three files per container.
View them with `docker compose logs -f web` or `docker compose logs -f db`.
Logs remain available when a container restarts, but are removed when that
container is deleted.
