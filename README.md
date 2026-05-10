# URL Shortener

A production-quality URL shortener built as a monorepo with React Router v7 (SSR), PostgreSQL, and Redis.

## Features

- **URL Shortening** — Generate 10-character base62 short codes with nanoid
- **Fast Redirects** — Redis cache-first lookup (10-min TTL) with Prisma fallback
- **Click Analytics** — Fire-and-forget click tracking with stats page and 30-day timeline chart
- **Rate Limiting** — POST 10/min, GET 100/min (Redis-backed with in-memory fallback)
- **Bot Protection** — reCAPTCHA v3 server-side verification with action validation and 5s timeout
- **UI Components** — DaisyUI v5 component library (Button, Input, Alert, Card, Badge, CopyButton, etc.)
- **Structured Logging** — pino JSON logging with request/response middleware
- **Security Headers** — X-Content-Type-Options, X-Frame-Options, Referrer-Policy
- **Graceful Shutdown** — Clean teardown of Prisma and Redis connections
- **91 Passing Tests** — Vitest 4.x with @testing-library/react

## Tech Stack

| Technology                                                            | Version   | Description                                                                                       |
| --------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------- |
| [Node.js](https://nodejs.org/)                                        | 22        | JavaScript runtime for server-side execution                                                      |
| [pnpm](https://pnpm.io/)                                              | 10.20.0   | Fast, disk-efficient package manager with built-in monorepo support via workspaces                |
| [Turborepo](https://turbo.build/)                                     | ^2.7.4    | High-performance build system for monorepos. Runs tasks in parallel and caches results            |
| [React](https://react.dev/)                                           | ^19.2.3   | Library for building user interfaces with components                                              |
| [React Router v7](https://reactrouter.com/)                           | 7.15.0    | Full-stack React framework. Handles routing, data loading (loaders), mutations (actions), and SSR |
| [TypeScript](https://www.typescriptlang.org/)                         | ^5.9.2    | Typed superset of JavaScript for catching errors at compile time                                  |
| [Tailwind CSS](https://tailwindcss.com/)                              | ^4.3.0    | Utility-first CSS framework for rapid UI development                                              |
| [DaisyUI](https://daisyui.com/)                                       | 5         | CSS component library built on Tailwind CSS                                                       |
| [Vite](https://vite.dev/)                                              | ^7.3.3    | Fast build tool and dev server with hot module replacement                                        |
| [PostgreSQL](https://www.postgresql.org/)                              | 16        | Relational database for URL and click data persistence                                            |
| [Prisma](https://www.prisma.io/)                                      | ^7.8.0    | Type-safe ORM for database access, schema management, and migrations                              |
| [Redis](https://redis.io/)                                            | 7         | In-memory data store for caching and rate limiting                                                |
| [ioredis](https://github.com/redis/ioredis)                           | ^5.10.1   | Redis client for Node.js with cluster and sentinel support                                        |
| [pino](https://getpino.io/)                                           | latest    | Structured JSON logging for Node.js                                                               |
| [recharts](https://recharts.org/)                                      | 2.15.3    | Chart library for click analytics visualizations                                                  |
| [Vitest](https://vitest.dev/)                                          | 4.x       | Fast unit test framework with native TypeScript support                                           |
| [rate-limiter-flexible](https://github.com/animir/node-rate-limiter-flexible) | latest | Rate limiting middleware with Redis and in-memory backends                                        |

## Project Structure

```
url-shortener/
├── applications/web/           # React Router v7 SSR application
│   ├── app/
│   │   ├── components/         # UI components (ShortenForm, UrlTable, Sparkline, etc.)
│   │   │   └── ui/             # Reusable DaisyUI component library
│   │   ├── routes/             # Route handlers (_index, s.$code, stats.$code)
│   │   ├── server/
│   │   │   ├── lib/            # Logger, shutdown hooks
│   │   │   ├── middleware/     # Logging, rate limiting
│   │   │   ├── repositories/  # Data access (interfaces + Prisma implementations)
│   │   │   └── services/      # Business logic (URL, cache, reCAPTCHA, shortcode)
│   │   └── services/          # Client-side services (clipboard, URL helpers)
│   └── .storybook/            # Storybook configuration
├── infra/database/            # Shared database package
│   ├── prisma/                # Schema + migrations
│   └── src/                   # Prisma client, Redis client, exports
├── docker-compose.yml
├── Dockerfile
└── docker-entrypoint.sh
```

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

## Testing

```bash
pnpm test                                        # Run all tests via Turborepo
pnpm test:coverage                               # Run tests with coverage report
pnpm --filter web test                           # Run web app tests only
pnpm --filter @url-shortener/database test       # Run database tests only
```

### Environment Variables

| Variable                 | Description                                      | Default                                                            |
| ------------------------ | ------------------------------------------------ | ------------------------------------------------------------------ |
| `DATABASE_URL`           | PostgreSQL connection string                     | `postgresql://postgres:postgres@localhost:5432/urlshortener?schema=public` |
| `REDIS_URL`              | Redis connection string                          | `redis://localhost:6379`                                           |
| `PUBLIC_URL`             | Base URL for shortened links                     | `http://localhost:5173`                                            |
| `RECAPTCHA_SECRET_KEY`   | Google reCAPTCHA v3 secret key                   | —                                                                  |
| `VITE_RECAPTCHA_SITE_KEY`| Google reCAPTCHA v3 site key (client-side)        | —                                                                  |
| `RECAPTCHA_DISABLED`     | Set to `"true"` to disable reCAPTCHA (development)| —                                                                  |
| `NODE_ENV`               | Environment (`development`/`production`/`test`)  | `development`                                                      |
