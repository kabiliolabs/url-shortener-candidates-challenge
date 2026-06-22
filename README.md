# URL Shortener

Shorten URLs, redirect short codes to their target, and track click statistics.

## Tech Stack

```
url-shortener/
├── applications/web/         # React Router v7 app (SSR)
│   ├── app/
│   │   ├── .server/          # server-only: Prisma client, repository, rate limiter, DI container
│   │   ├── components/       # shadcn/ui primitives + UrlForm / UrlList
│   │   └── routes/           # _index (create + list), s.$code (redirect + click tracking)
│   └── prisma/               # schema.prisma + migrations
└── libs/engine/              # pure domain: short-code generation, URL validation, shortener service, repository port
```

| Technology                                    | Description                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [pnpm](https://pnpm.io/)                      | Fast, disk-efficient package manager with built-in monorepo support via workspaces                |
| [Turbo](https://turbo.build/)                 | High-performance build system for monorepos. Runs tasks in parallel and caches results            |
| [React](https://react.dev/)                   | Library for building user interfaces with components                                              |
| [React Router v7](https://reactrouter.com/)   | Full-stack React framework. Handles routing, data loading (loaders), mutations (actions), and SSR |
| [TypeScript](https://www.typescriptlang.org/) | Typed superset of JavaScript for catching errors at compile time                                  |
| [Tailwind CSS](https://tailwindcss.com/)      | Utility-first CSS framework for rapid UI development                                              |
| [shadcn/ui](https://ui.shadcn.com/) + [Radix](https://www.radix-ui.com/) | Accessible, reusable UI components owned in-repo                       |
| [Prisma](https://www.prisma.io/)              | Type-safe ORM and migration tool                                                                  |
| [PostgreSQL](https://www.postgresql.org/)     | Relational database for durable storage                                                           |
| [Zod](https://zod.dev/)                       | Schema validation for untrusted input                                                             |
| [Vitest](https://vitest.dev/)                 | Unit testing framework for the domain layer                                                       |
| [Vite](https://vite.dev/)                     | Fast build tool and dev server with hot module replacement                                        |

## Architecture

- **`libs/engine`** is the pure domain core: short-code generation (crypto-secure base62 with collision retry), URL validation + anti-SSRF, the `UrlShortener` service, and the `UrlRepository` **port**. It has no dependency on Prisma or React Router.
- **`applications/web`** implements the port with Prisma/Postgres (`app/.server/`), wires everything in a composition root, and exposes the routes and UI. Dependency direction is one-way: `web → engine`.

## Local Setup

```bash
pnpm install
cp .env.example .env

# Start Postgres (the compose DB exposes 5432 on the host for local dev)
docker compose up -d db

# Generate the Prisma client and create the schema
pnpm --filter web prisma:generate
pnpm --filter web exec prisma migrate deploy

pnpm dev
```

Open `http://localhost:5173`

Run the domain tests with:

```bash
pnpm --filter @url-shortener/engine test
```

## Docker Setup

```bash
docker compose up --build
```

Open `http://localhost:3000`

The web container waits for Postgres to be healthy, applies migrations on
startup, then serves the app. Data is persisted in the `pgdata` volume, so it
survives `docker compose restart` / `down` + `up`.
