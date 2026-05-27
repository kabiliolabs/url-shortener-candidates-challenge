# URL Shortener

## Tech Stack

```txt
url-shortener/
  applications/web/    # React + React Router v7
  libs/engine/         # Domain logic
```

| Technology                                    | Description                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [pnpm](https://pnpm.io/)                      | Fast, disk-efficient package manager with built-in monorepo support via workspaces. Runs inside Docker |
| [Turbo](https://turbo.build/)                 | High-performance build system for monorepos. Runs tasks in parallel and caches results            |
| [React](https://react.dev/)                   | Library for building user interfaces with components                                              |
| [React Router v7](https://reactrouter.com/)   | Full-stack React framework. Handles routing, data loading, mutations and SSR                      |
| [Radix UI](https://www.radix-ui.com/)          | Accessible primitives wrapped behind local reusable UI components                                 |
| [TypeScript](https://www.typescriptlang.org/) | Typed superset of JavaScript for catching errors at compile time                                  |
| [Tailwind CSS](https://tailwindcss.com/)      | Utility-first CSS framework for rapid UI development                                              |
| [Vite](https://vite.dev/)                     | Fast build tool and dev server with hot module replacement                                        |
| [PostgreSQL](https://www.postgresql.org/)     | Database used by the local Docker environment                                                     |
| [Prisma](https://www.prisma.io/)              | ORM and migration tooling for the PostgreSQL persistence layer                                     |

## Docker Setup

The local environment runs through Docker only. Node, pnpm and PostgreSQL do not need to be installed on the host machine.

```bash
docker compose up --build
```

Open `http://localhost:5173`.

The compose stack starts:

- `web`: React Router development server.
- `db`: PostgreSQL 16 with a persistent Docker volume.

## Environment

Docker Compose provides sensible defaults, so `.env` is optional for local development. To override ports, credentials or the public host:

```bash
cp .env.example .env
docker compose up --build
```

## Useful Commands

Run project commands from inside Docker:

```bash
docker compose run --rm web pnpm build
docker compose run --rm web pnpm typecheck
docker compose run --rm web pnpm test
docker compose run --rm web pnpm db:migrate
docker compose run --rm web pnpm db:deploy
```

Stop the stack:

```bash
docker compose down
```

Reset the database volume:

```bash
docker compose down -v
```

Run the final quality gate:

```bash
docker compose run --rm web pnpm quality
```

## Architecture

The project is split into a small engine package and a React Router web app:

- `libs/engine`: pure short URL domain, validation rules, use cases and ports. It does not import React, Prisma, Docker or environment variables.
- `applications/web`: HTTP routes, UI components, Prisma repository, database client and runtime configuration.

Routes act as adapters: they parse requests, call server operations and map expected errors to user feedback. Persistence is hidden behind the engine repository port.

## UI Components

Radix primitives are used through local wrappers instead of being imported directly from routes. This keeps the app consistent and leaves room to customize or replace the component internals later.

Current reusable components live under `applications/web/app/components/`, including `Button`, `TextField`, `Callout`, `UrlShortenerForm`, `ShortenedUrlResult` and `UrlList`.

## Abuse Prevention

The application includes lightweight protections suitable for this challenge:

- HTTP(S)-only URL validation and malformed URL feedback.
- Rejection of unsupported ASCII control characters in original URLs.
- Maximum original URL length.
- Non-guessable short codes generated with `crypto.randomInt`.
- Collision checks with retries before persisting a short URL.
- Rejection of URLs pointing back to existing short URL routes under `/s/`, including simple percent-encoded variants.
- Basic per-client rate limiting for URL creation.
- Production error boundary avoids exposing stack traces.

## Production Image

The Dockerfile still includes a production target:

```bash
docker build --target production -t url-shortener .
docker run -p 3000:3000 -e PUBLIC_URL=http://localhost:3000 url-shortener
```
