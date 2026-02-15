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

The app uses **PostgreSQL** and **Prisma**. Follow these steps so the app can connect and create the required tables.

#### 1. Start PostgreSQL

**Option A – Docker Compose (recommended)**

From the **repo root**:

```bash
docker-compose up -d postgres
```

This starts Postgres on port **5432** with user `urlshortener`, password `urlshortener`, database `urlshortener`.

**Option B – One-off Docker container**

```bash
docker run -d -p 5432:5432 -e POSTGRES_USER=urlshortener -e POSTGRES_PASSWORD=urlshortener -e POSTGRES_DB=urlshortener postgres:16-alpine
```

**Option C – Local PostgreSQL**

Install PostgreSQL and create a database, then use its connection URL in step 2.

#### 2. Set `DATABASE_URL`

- When you run `pnpm dev` from the **repo root**, the app loads `.env` from the **repo root**. Create or edit **`.env`** there (same folder as `package.json` and `docker-compose.yml`).
- When you run Prisma commands from `applications/web`, Prisma loads `.env` from **`applications/web`**. So either put a `.env` in `applications/web` with the same `DATABASE_URL`, or set it in the shell when running migrations.

**Example `.env` (repo root and/or `applications/web/.env`):**

```env
# Database – use port 5432 for local/Docker Postgres
DATABASE_URL="postgresql://urlshortener:urlshortener@localhost:5432/urlshortener"

# Optional: base URL for short links
PUBLIC_URL=http://localhost:5173
```

Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`. For local Docker use `localhost` and port **5432** (if your DB is on a different port, change it here).

#### 3. Create the tables (run migrations)

Prisma creates the `ShortenedUrl` table from the existing migration. From **`applications/web`**:

```bash
cd applications/web
npx prisma migrate deploy
```

If `DATABASE_URL` is only in the repo root `.env`, either copy it into `applications/web/.env`, or set it in the shell:

```powershell
# PowerShell (repo root)
$env:DATABASE_URL="postgresql://urlshortener:urlshortener@localhost:5432/urlshortener"; cd applications/web; npx prisma migrate deploy
```

#### 4. Verify the connection (optional)

From `applications/web`:

```bash
npx prisma db execute --stdin
```

Type `SELECT 1;`, press Enter, then Ctrl+D (or Ctrl+Z then Enter on Windows). No error means the database is reachable.

Or open Prisma Studio to browse data:

```bash
npx prisma studio
```

Opens http://localhost:5555 (e.g. `ShortenedUrl` table).

#### 5. Start the app

From the **repo root**:

```bash
pnpm dev
```

Then open **http://localhost:5173**.

**Checklist**

| Step | Action |
|------|--------|
| 1 | Postgres is running on port 5432 (`docker-compose up -d postgres` or local install). |
| 2 | `DATABASE_URL` in repo root `.env` (and in `applications/web/.env` if you run Prisma from there) uses **port 5432**. |
| 3 | Migrations applied: `cd applications/web && npx prisma migrate deploy`. |
| 4 | App started from repo root: `pnpm dev`. |

**If the app can’t connect:** ensure `DATABASE_URL` uses `localhost:5432` (not another port), and user/password match your Postgres (e.g. `urlshortener` / `urlshortener` for Docker Compose).

More detail: **[applications/web/DATABASE.md](applications/web/DATABASE.md)**.

---

## Docker Setup

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) for Windows. Install it, then start Docker Desktop and wait until it’s running (whale icon in the system tray).

From the project folder, in **PowerShell**, **Command Prompt**, or **Git Bash**:

```bash
docker-compose up --build
```

The first run may take a few minutes (downloads image, builds app). When you see the server ready, open **http://localhost:3000**

To stop: press `Ctrl+C`. To run in the background: `docker-compose up --build -d`
