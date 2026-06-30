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
pnpm dev
```

Open `http://localhost:5173`

## Docker Setup

Runs the web app and a PostgreSQL database together. No local Node/pnpm install is
needed — everything is built inside the image.

### Prerequisites

- [Docker Engine](https://docs.docker.com/engine/install/) with the Compose v2 plugin
  (`docker compose version` should print `v2.x` or newer)

### Start

```bash
docker-compose up --build
```

This will:

1. Build the web image (runs `prisma generate` during the build).
2. Start `postgres` and wait until it is healthy.
3. Run `prisma migrate deploy` automatically on container start, applying the
   schema before the server boots — no manual migration step.
4. Launch the server.

Open `http://localhost:3000`

### Environment variables

The compose file wires these for you; you do **not** need a `.env` for Docker:

| Variable       | Service  | Value (compose)                                                       | Purpose                                              |
| -------------- | -------- | --------------------------------------------------------------------- | ---------------------------------------------------- |
| `DATABASE_URL` | web      | `postgresql://postgres:postgres@postgres:5432/url_shortener?schema=public` | Prisma connection string (host is the `postgres` service) |
| `PUBLIC_URL`   | web      | `http://localhost:3000`                                               | Base URL used when building short links              |
| `NODE_ENV`     | web      | `production`                                                          | Production server mode                               |

Postgres credentials (`postgres` / `postgres` / db `url_shortener`) are set on the
`postgres` service. They are development defaults — change them for any real deployment.

### Data persistence

Database data is stored in the named volume `postgres_data`, so it survives container
restarts:

```bash
docker-compose down       # stop & remove containers, KEEP data
docker-compose up         # data is still there
```

To wipe the database (fresh state), remove the volume:

```bash
docker-compose down -v    # stop & remove containers AND data
```
