# URL Shortener

## Tech Stack

```
url-shortener/
├── applications/web/    # React + React Router v7
└── infra/database/      # Prisma client, Redis client, migrations
```

| Technology                                    | Version   | Description                                                                                       |
| --------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------- |
| [Node.js](https://nodejs.org/)                | 22        | JavaScript runtime for server-side execution                                                      |
| [pnpm](https://pnpm.io/)                      | 10.20.0   | Fast, disk-efficient package manager with built-in monorepo support via workspaces                |
| [Turborepo](https://turbo.build/)             | ^2.7.4    | High-performance build system for monorepos. Runs tasks in parallel and caches results            |
| [React](https://react.dev/)                   | ^19.2.3   | Library for building user interfaces with components                                              |
| [React Router v7](https://reactrouter.com/)   | 7.15.0    | Full-stack React framework. Handles routing, data loading (loaders), mutations (actions), and SSR |
| [TypeScript](https://www.typescriptlang.org/) | ^5.9.2    | Typed superset of JavaScript for catching errors at compile time                                  |
| [Tailwind CSS](https://tailwindcss.com/)      | ^4.3.0    | Utility-first CSS framework for rapid UI development                                              |
| [Vite](https://vite.dev/)                     | ^7.3.3    | Fast build tool and dev server with hot module replacement                                        |
| [PostgreSQL](https://www.postgresql.org/)     | 16        | Relational database for URL and click data persistence                                            |
| [Prisma](https://www.prisma.io/)              | ^7.8.0    | Type-safe ORM for database access, schema management, and migrations                              |
| [Redis](https://redis.io/)                    | 7         | In-memory data store for caching and rate limiting                                                |
| [ioredis](https://github.com/redis/ioredis)   | ^5.10.1   | Redis client for Node.js with cluster and sentinel support                                        |

## Local Setup

```bash
pnpm install
cp .env.example .env
docker compose up db cache -d                          # Start PostgreSQL and Redis
pnpm --filter @url-shortener/database db:migrate:dev   # Run database migrations
pnpm dev
```

Open `http://localhost:5173`

## Docker Setup

```bash
docker compose up --build
```

Migrations run automatically on container startup via `docker-entrypoint.sh`.

Open `http://localhost:3000`

## Database

### Prerequisites

[Docker](https://www.docker.com/) is required to run PostgreSQL and Redis locally.

### Starting Services

```bash
docker compose up db cache -d
```

This starts PostgreSQL on port `5432` and Redis on port `6379`.

### Prisma Commands

All commands target the `@url-shortener/database` workspace:

| Command                                                        | Description                              |
| -------------------------------------------------------------- | ---------------------------------------- |
| `pnpm --filter @url-shortener/database db:migrate:dev`         | Create and apply a new migration         |
| `pnpm --filter @url-shortener/database db:migrate:deploy`      | Apply pending migrations (CI/production) |
| `pnpm --filter @url-shortener/database db:generate`            | Regenerate the Prisma client             |
| `pnpm --filter @url-shortener/database db:studio`              | Open Prisma Studio (visual DB browser)   |
| `pnpm --filter @url-shortener/database db:reset`               | Reset the database and re-apply migrations |

### Schema Changes Workflow

1. Edit `infra/database/prisma/schema.prisma`
2. Run `pnpm --filter @url-shortener/database db:migrate:dev` — creates a migration and updates the client
3. Import models from `@url-shortener/database` in application code

### Environment Variables

| Variable       | Description                      | Default                                                            |
| -------------- | -------------------------------- | ------------------------------------------------------------------ |
| `DATABASE_URL` | PostgreSQL connection string     | `postgresql://postgres:postgres@localhost:5432/urlshortener?schema=public` |
| `REDIS_URL`    | Redis connection string          | `redis://localhost:6379`                                           |
