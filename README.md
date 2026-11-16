# URL Shortener

Shortens URLs, redirects short codes to the original URL and counts clicks.

## Docker Setup

Requires Docker with Compose v2. From a clean clone:

```bash
git clone https://github.com/kabiliolabs/url-shortener-candidates-challenge.git
cd url-shortener-candidates-challenge
git checkout refactor/laia-chorro
docker compose up --build
```

Open `http://localhost:3000`

This starts PostgreSQL and the web app. The app waits for the database to be healthy, applies pending migrations and then starts. Data is kept in the `db-data` volume and survives restarts; `docker compose down -v` deletes it.

No `.env` file is needed: the configuration for this mode is in `docker-compose.yml`. Ports 3000 and 5432 must be free.

## Local Setup

Requires Node 20.19 or newer, pnpm 10 and Docker for the database. The app itself runs on the host.

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

`db:generate` has to run before the first `pnpm dev` or `pnpm typecheck`: `pnpm install` does not generate the Prisma client by itself.

Database scripts, run with `pnpm --filter @url-shortener/engine <script>`:

| Script        | Description                                                          |
| ------------- | -------------------------------------------------------------------- |
| `db:migrate`  | Creates a migration from schema changes and applies it (development) |
| `db:deploy`   | Applies pending migrations without creating new ones                 |
| `db:generate` | Regenerates the Prisma client after a schema change                  |

## Configuration

| Variable       | Description                                                                |
| -------------- | -------------------------------------------------------------------------- |
| `PUBLIC_URL`   | Origin used to build short URLs. Port 5173 in development, 3000 in Docker  |
| `DATABASE_URL` | PostgreSQL connection string. The examples match the `db` service's values |
| `TRUST_PROXY`  | `true` only when the app runs behind exactly one reverse proxy             |

`PUBLIC_URL` is required: the app refuses to start without it, or if it is not a valid URL, instead of building broken short URLs. Only its origin is used. `DATABASE_URL` is read by Prisma. `TRUST_PROXY` decides who counts as a client for the rate limit: with `true`, the client is the last value of `X-Forwarded-For`, the one a single trusted proxy appends. With `false` (the default, and what Docker Compose uses, since nothing sits in front of the app) the header is ignored, because a client could forge it, and **the rate limit is global**: all clients share the same 10 creations per minute.

In development there are two `.env` files because two tools read them: the web app loads the root one, and the Prisma CLI runs from `libs/engine` and loads the one there. Both hold the same `DATABASE_URL`.

## Tests

```bash
pnpm test
```

Unit tests run with [Vitest](https://vitest.dev/) and live next to the code in `libs/engine/src` as `*.test.ts`. They cover the use cases, the URL validation and the rate limiter, using an in-memory repository and an injected clock, so they need no database. To run a single file:

```bash
pnpm --filter @url-shortener/engine test shorten-url
```

## Architecture

```
url-shortener/
├── applications/web/                # React Router v7: UI and HTTP
│   └── app/
│       ├── services.server.ts       # Composition root: reads config, wires everything
│       ├── lib/prisma.server.ts     # The PrismaClient singleton
│       ├── routes/                  # Loaders and actions: call use cases, map errors to HTTP
│       └── components/              # ShortenForm, ShortUrlsTable and shadcn/ui primitives
└── libs/engine/
    ├── prisma/                      # Schema and migrations
    └── src/
        ├── domain/                  # ShortUrl, OriginalUrl, ports, domain errors
        ├── application/             # Use cases: ShortenUrl, ResolveShortUrl, ListShortUrls
        └── infrastructure/          # Prisma repository, code generator, rate limiter, in-memory repository
```

| Layer            | What lives there                                                                                                                              | May depend on            |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `domain`         | The `ShortUrl` read model, the `OriginalUrl` value object that validates input, the `ShortUrlRepository` and `ShortCodeGenerator` ports, errors | Nothing                  |
| `application`    | One class per use case. Retry on code collision lives in `ShortenUrl`                                                                         | `domain`                 |
| `infrastructure` | Implementations of the ports (Prisma, random codes, in-memory for tests) and the rate limiter                                                 | `domain`, Prisma, Node   |
| `applications/web` | Routes, components and the composition root                                                                                                 | The engine's public API  |

Importing the engine has no side effects: it reads no environment variables and creates no database client. The web app does both in `services.server.ts` and passes them in, and routes get the use cases only from that file.

The two requests, end to end:

- **Create:** the `action` of `routes/_index.tsx` checks the rate limit and calls `ShortenUrl`. The use case builds an `OriginalUrl` (which rejects invalid input), asks the generator for a code and inserts through the repository. Uniqueness comes from a database `UNIQUE` constraint: if the insert fails because the code exists, the use case retries with a new code, up to five times. There is no lookup before the insert, so two concurrent requests cannot claim the same code. The action maps the outcome to `200`, `400` (invalid URL), `429` (rate limit) or `500`.
- **Follow:** the `loader` of `routes/s.$code.tsx` calls `ResolveShortUrl`, which counts the click and reads the original URL in a single atomic `UPDATE ... SET clicks = clicks + 1 ... RETURNING`. It answers `302` (not `301`, which browsers cache, so later clicks would not be counted) or `404` for an unknown code.

## Abuse protection

- **Rate limit:** creating short URLs is limited to 10 requests per minute per client. Beyond that the app answers `429` with a `Retry-After` header. Every attempt counts, including rejected input. Who a client is depends on `TRUST_PROXY`: see [Configuration](#configuration).
- **Input validation:** only `http` and `https` URLs up to 2048 characters are accepted, and the app's own short URLs cannot be shortened again.
- **Short codes:** 7 random base62 characters from a cryptographically secure generator, so existing links cannot be found by guessing.

The limiter keeps its counters in memory: they reset when the app restarts and are not shared between instances. A deployment with several instances would move them to a shared store such as Redis.

## Tech Stack

| Technology                                    | Description                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [pnpm](https://pnpm.io/)                      | Fast, disk-efficient package manager with built-in monorepo support via workspaces                |
| [Turbo](https://turbo.build/)                 | High-performance build system for monorepos. Runs tasks in parallel and caches results            |
| [React](https://react.dev/)                   | Library for building user interfaces with components                                              |
| [React Router v7](https://reactrouter.com/)   | Full-stack React framework. Handles routing, data loading (loaders), mutations (actions), and SSR |
| [TypeScript](https://www.typescriptlang.org/) | Typed superset of JavaScript for catching errors at compile time                                  |
| [Tailwind CSS](https://tailwindcss.com/)      | Utility-first CSS framework for rapid UI development                                              |
| [shadcn/ui](https://ui.shadcn.com/)           | Accessible components built on Radix, copied into `app/components/ui`                             |
| [Vite](https://vite.dev/)                     | Fast build tool and dev server with hot module replacement                                        |
| [PostgreSQL](https://www.postgresql.org/)     | Relational database. Runs as the `db` service in Docker Compose                                   |
| [Prisma](https://www.prisma.io/)              | ORM and migration tool. Schema and migrations live in `libs/engine/prisma`                        |
| [Vitest](https://vitest.dev/)                 | Unit test runner                                                                                  |
