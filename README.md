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

## Local Setup

**Prerequisites:** [Node.js](https://nodejs.org/) (v18+).

### Option A: With pnpm installed

```bash
pnpm install
cp .env.example .env   # Git Bash / WSL
pnpm dev
```

### Option B: Windows (no pnpm)

In **PowerShell** or **Command Prompt**:

```powershell
npx pnpm install
copy .env.example .env
npx pnpm dev
```

In **Git Bash**:

```bash
npx pnpm install
cp .env.example .env
npx pnpm dev
```

Then open **http://localhost:5173**

### Local development with PostgreSQL

The app uses **PostgreSQL** and **Prisma**. For local dev:

1. Run PostgreSQL (e.g. Docker: `docker run -d -p 5432:5432 -e POSTGRES_USER=urlshortener -e POSTGRES_PASSWORD=urlshortener -e POSTGRES_DB=urlshortener postgres:16-alpine`).
2. In the repo root, copy `.env.example` to `.env` and set `DATABASE_URL` (see `.env.example`).
3. In `applications/web`, run migrations: `npx prisma migrate deploy`.
4. Start the app from the repo root: `npx pnpm dev` (or `pnpm dev`).

Or use **Docker Compose** (see below); it starts PostgreSQL and the app together.

---

## Docker Setup

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) for Windows. Install it, then start Docker Desktop and wait until it’s running (whale icon in the system tray).

From the project folder, in **PowerShell**, **Command Prompt**, or **Git Bash**:

```bash
docker-compose up --build
```

The first run may take a few minutes (downloads image, builds app). When you see the server ready, open **http://localhost:3000**

To stop: press `Ctrl+C`. To run in the background: `docker-compose up --build -d`
