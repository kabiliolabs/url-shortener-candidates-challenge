# URL Shortener

## Tech Stack

| Technology                                    | Description                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [pnpm](https://pnpm.io/)                      | Fast, disk-efficient package manager with built-in monorepo support via workspaces                |
| [Turbo](https://turbo.build/)                 | High-performance build system for monorepos. Runs tasks in parallel and caches results            |
| [React](https://react.dev/)                   | Library for building user interfaces with components                                              |
| [TypeScript](https://www.typescriptlang.org/) | Typed superset of JavaScript for catching errors at compile time                                  |
| [Radix](https://www.radix-ui.com/)            | Open source component library optimized for fast development                                      |
| [Vite](https://vite.dev/)                     | Fast build tool and dev server with hot module replacement                                        |

## Docker Setup

Clone the repo and checkout the appropriate branch

```bash
git clone git@github.com:remi-cab/url-shortener-candidates-challenge.git


cd /path/to/url-shortener-candidates-challenge


git checkout remi
```

Copy the .env.example file

```bash
cp ./apps/api/.env.example ./apps/api/.env
```

Start the application with Docker Compose:

```bash
docker compose up --build
```

If running for the first time, apply the Prisma database migrations:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shortener?schema=public" \
  pnpm --filter api exec prisma migrate deploy
```

Open `http://localhost:8080`