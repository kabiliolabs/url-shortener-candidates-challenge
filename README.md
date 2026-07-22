# URL Shortener

## Tech Stack

```
url-shortener/
├── applications/web/    # React + React Router v7
├── applications/api/    # Node.js HTTP API + Prisma + MongoDB
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
| [Prisma](https://www.prisma.io/)              | ORM and schema management layer for MongoDB                                                       |

## Local Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open `http://localhost:5173`

## Docker Setup

```bash
docker-compose up --build
```

Open `http://localhost:3000`

The API is available at `http://localhost:4000`. MongoDB data is stored in the
`mongo-data` Docker volume and survives container restarts. The API container
applies the Prisma schema before it starts.

### API endpoints

- `POST /urls` with `{ "url": "https://example.com" }` creates a short URL.
- `GET /urls/:code` resolves a URL and increments its click count.
- `GET /urls?limit=50` lists recently created URLs with statistics.
- `GET /docs` opens the Swagger UI for the API.
- `GET /docs.json` returns the OpenAPI document as JSON.

The API validates HTTP(S) destination URLs, rejects URLs with credentials,
limits request bodies to 10 KB, applies an in-memory limit of 10 creation
requests per IP per minute, and emits basic hardening headers.

## Tests

```bash
pnpm --filter @url-shortener/api test
```

To apply the Prisma schema outside Docker, run:

```bash
pnpm --filter @url-shortener/api db:push
```
