# URL Shortener

## Tech Stack

```
url-shortener/
├── applications/web/            # React + React Router v7
│   └── app/services.server.ts   # Composition root: reads config, wires the use cases
└── libs/engine/
    ├── prisma/                  # Schema and migrations
    └── src/
        ├── domain/              # ShortUrl, repository and generator ports, errors
        ├── application/         # Use cases: ShortenUrl, ResolveShortUrl, ListShortUrls
        └── infrastructure/      # Prisma repository, random code generator, in-memory repository
```

Dependencies point inwards: `application` depends only on the interfaces in `domain`, and `infrastructure` implements them. The engine reads no environment variables and creates no database client when imported; the web app does both in `services.server.ts` and passes them in.

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
pnpm --filter @url-shortener/engine db:generate
pnpm --filter @url-shortener/engine db:deploy
pnpm dev
```

Open `http://localhost:5173`

There are two `.env` files because two tools read them: the web app loads the root one, and the Prisma CLI runs from `libs/engine` and loads the one there. Both hold the same `DATABASE_URL`.

| Variable       | Description                                                                 |
| -------------- | --------------------------------------------------------------------------- |
| `PUBLIC_URL`   | Origin used to build short URLs. Port 5173 in development, 3000 in Docker   |
| `DATABASE_URL` | PostgreSQL connection string. The examples match the `db` service's values  |
| `TRUST_PROXY`  | `true` only behind a single reverse proxy. See [Abuse protection](#abuse-protection) |

Database scripts, run with `pnpm --filter @url-shortener/engine <script>`:

| Script        | Description                                                              |
| ------------- | ------------------------------------------------------------------------ |
| `db:migrate`  | Creates a migration from schema changes and applies it (development)     |
| `db:deploy`   | Applies pending migrations without creating new ones                     |
| `db:generate` | Regenerates the Prisma client after a schema change                      |

## Abuse protection

- **Rate limit:** creating short URLs is limited to 10 requests per minute per client. Beyond that the app answers `429` with a `Retry-After` header. Every attempt counts, including rejected input.
- **Who a client is:** with `TRUST_PROXY=true`, the last value of `X-Forwarded-For`, which is the one a single trusted proxy appends. Earlier values come from the client and can be forged. With `TRUST_PROXY=false` (the default, and what Docker Compose uses, since nothing sits in front of the app) the header is ignored and all clients share one limit. When trying the app locally this means 10 creations per minute in total.
- **Input validation:** only `http` and `https` URLs up to 2048 characters are accepted, and the app's own short URLs cannot be shortened again.
- **Short codes:** 7 random base62 characters from a cryptographically secure generator, so existing links cannot be found by guessing.

The limiter keeps its counters in memory: they reset when the app restarts and are not shared between instances. A deployment with several instances would move them to a shared store such as Redis.

## Tests

```bash
pnpm test
```

Unit tests run with [Vitest](https://vitest.dev/) and live next to the code in `libs/engine/src` as `*.test.ts`. They cover the use cases and the URL validation against an in-memory repository, so they need no database. To run a single file:

```bash
pnpm --filter @url-shortener/engine test shorten-url
```

## Docker Setup

```bash
docker compose up --build
```

Open `http://localhost:3000`

This starts PostgreSQL and the web app. The app waits for the database to be healthy, applies pending migrations and then starts. Data is kept in the `db-data` volume and survives restarts; `docker compose down -v` deletes it.

No `.env` file is needed: the configuration for this mode is in `docker-compose.yml`.
