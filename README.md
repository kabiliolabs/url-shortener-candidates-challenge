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

## Architecture

Hexagonal architecture with a DDD approach. The reasoning is in [DECISIONS.md](./DECISIONS.md)
and what the app does is in [SPECS.md](./SPECS.md).

```
libs/engine/src/
├── domain/           # ShortUrl aggregate, value objects, domain errors and ports (interfaces)
└── application/      # Use cases: ShortenUrl, ResolveShortUrl, ListShortUrls
libs/infrastructure/  # Adapters that implement the ports: Prisma repository, code generator, rate limiter
applications/web/     # React Router app. Routes call use cases, wiring is in app/.server/container.ts
```

Dependencies only point inwards: `web → infrastructure → engine`. The domain doesn't know about
Prisma, React or HTTP.

**Adding a feature:**

1. Add or update the spec in `SPECS.md`.
2. Model it in the domain (entity, value object or domain error). If it needs something external,
   define a port.
3. Write the use case in `application/` and test it with in-memory adapters.
4. Implement the adapter in `libs/infrastructure` and register it in the container.
5. Call the use case from the route and map domain errors to user-facing messages.
6. If you made a non-obvious choice, add an entry to `DECISIONS.md`.

## Local Setup

Needs Node 20+, pnpm (`corepack enable`) and Docker for the database.

```bash
pnpm install
cp .env.example .env
docker compose up -d db                                    # Postgres on localhost:5434
pnpm --filter @url-shortener/infrastructure db:migrate     # create the tables
pnpm dev
```

Open `http://localhost:5173`. If that port is taken, Vite picks the next one; update `PUBLIC_URL`
in `.env` to match so the short links point to the right place.

```bash
pnpm test        # unit + integration tests (integration ones need the db running)
pnpm typecheck
```

## Docker Setup

```bash
docker compose up --build
```

Open `http://localhost:3000`. This starts Postgres and the app; migrations run automatically on
startup and data is kept in the `db-data` volume (`docker compose down -v` wipes it).
