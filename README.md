# URL Shortener

## Tech Stack

```
url-shortener/
├── applications/web/    # React Router delivery and infrastructure adapters
├── libs/engine/         # Domain and application logic
└── prisma/              # PostgreSQL schema and migrations
```

| Technology                                    | Description                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [pnpm](https://pnpm.io/)                      | Fast, disk-efficient package manager with built-in monorepo support via workspaces                |
| [Turbo](https://turbo.build/)                 | High-performance build system for monorepos. Runs tasks in parallel and caches results            |
| [React](https://react.dev/)                   | Library for building user interfaces with components                                              |
| [React Router v8](https://reactrouter.com/)   | Full-stack React framework. Handles routing, data loading (loaders), mutations (actions), and SSR |
| [TypeScript](https://www.typescriptlang.org/) | Typed superset of JavaScript for catching errors at compile time                                  |
| [Tailwind CSS](https://tailwindcss.com/)      | Utility-first CSS framework for rapid UI development                                              |
| [Vite](https://vite.dev/)                     | Fast build tool and dev server with hot module replacement                                        |

## Local Setup

```bash
pnpm install
cp .env.example .env
docker compose up -d postgres
pnpm db:migrate
pnpm dev
```

Open `http://localhost:5173`

## Docker Setup

```bash
docker compose up --build
```

Open `http://localhost:3000`

The local development setup runs the web server on port `5173` and connects to
the PostgreSQL container through `127.0.0.1:5432`. The Compose setup starts
PostgreSQL first, waits for its healthcheck, applies Prisma migrations, and
then starts the web server on port `3000`. The `postgres-data` named volume
keeps shortened URLs and click counts across container restarts. To reset local
data, remove the volume with `docker compose down -v`.

If port `3000` is already in use, stop the process using it before starting the
web service. If port `5432` is already in use, update `DATABASE_URL` in `.env`
and the PostgreSQL port mapping in `docker-compose.yml` consistently.

### Verification

```bash
pnpm exec prisma validate
pnpm test
pnpm typecheck
pnpm build
docker compose config
docker compose up --build
```

The production container runs `prisma migrate deploy` before serving traffic.
The image supplies a placeholder `DATABASE_URL` only during client generation;
the runtime connection string comes from Docker Compose.

For the full verification and smoke-test procedure, see
[`docs/VERIFICATION.md`](docs/VERIFICATION.md). Architecture and engineering
decisions are documented in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and
[`docs/EXECUTION_PLAN.md`](docs/EXECUTION_PLAN.md). The AI-assisted workflow is
documented in [`docs/AI_USAGE.md`](docs/AI_USAGE.md). A current submission
summary is available in [`docs/SUBMISSION_NOTES.md`](docs/SUBMISSION_NOTES.md)
for the repository owner to transfer into the protected submission artifact.

## Design notes

- The web layer coordinates HTTP concerns and owns infrastructure adapters;
  validation and persistence are accessed through the `UrlRepository` port.
- Prisma implements the repository against PostgreSQL. The unique code index
  protects creation from collisions, and click counts use an atomic increment.
- Short codes use cryptographically secure random bytes and a uniqueness check.
- Short-link resolution increments click counts before returning to the dashboard.
- Each short-link resolution also records a click event, and the list view can expand a link
  to show the date and time of every recorded click.
- URL validation accepts only HTTP(S), limits input size, and the create action
  includes a small per-client rate limit to reduce abuse.
