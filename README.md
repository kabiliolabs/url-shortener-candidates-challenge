# URL Shortener

## Tech Stack

```
url-shortener/
├── applications/web/    # React + React Router v7
├── libs/database/     # Prisma ORM + PostgreSQL
└── libs/engine/       # Domain logic
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

## Local Setup

```bash
pnpm install
cp .env.example .env
docker compose up db -d
pnpm db:migrate
pnpm dev
```

Open `http://localhost:5173`

### Database (Prisma + PostgreSQL)

PostgreSQL runs on port **5433** (to avoid conflicts with a local Postgres on 5432).

```bash
docker compose up db -d      # Start PostgreSQL
pnpm db:migrate              # Apply migrations
pnpm db:generate             # Regenerate Prisma Client
pnpm db:studio               # Open Prisma Studio
pnpm db:seed                 # Run getting started script
```

## Docker Setup

```bash
docker-compose up --build
```

Open `http://localhost:3000`
