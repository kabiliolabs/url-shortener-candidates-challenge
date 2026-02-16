# 🗄️ Connecting to the database

The app uses **PostgreSQL** with **Prisma**. The backend reads `DATABASE_URL` from the environment.

## 1. 🚀 Start PostgreSQL

**Option A – 🐳 Docker (recommended)**

From the **repo root**:

```bash
docker-compose up -d postgres
```

This starts Postgres on port **5432** with user `urlshortener`, password `urlshortener`, database `urlshortener`.

**Option B – 📦 One-off container**

```bash
docker run -d -p 5432:5432 -e POSTGRES_USER=urlshortener -e POSTGRES_PASSWORD=urlshortener -e POSTGRES_DB=urlshortener postgres:16-alpine
```

**Option C – 💻 Local PostgreSQL**

Install PostgreSQL and create a database, then use its connection URL in step 2.

---

## 2. 🔐 Set `DATABASE_URL`

**Where the app gets env**

- When you run `pnpm dev` from the **repo root**, the app loads `.env` from the **repo root**.
- So create or edit **`.env`** in the **project root** (same folder as `package.json` and `docker-compose.yml`).

**Example `.env` at repo root**

```env
# Database (PostgreSQL)
# With Docker Compose postgres: postgresql://urlshortener:urlshortener@localhost:5432/urlshortener
DATABASE_URL="postgresql://urlshortener:urlshortener@localhost:5432/urlshortener"

# Optional: base URL for short links (defaults to request host)
PUBLIC_URL=http://localhost:5173
```

Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`

- 🐳 **Local Docker:** `localhost`, port `5432`
- 📦 **Docker Compose from host:** same as above
- 💻 **Custom install:** use your host, port, user, password, and database name.

---

## 3. 📤 Run migrations

From **`applications/web`**:

```bash
cd applications/web
npx prisma migrate deploy
```

If `DATABASE_URL` is only in the repo root `.env`, either:

- 📋 Copy the same `DATABASE_URL` into `applications/web/.env`, or
- ⚡ Run from repo root with env set:

  ```bash
  # From repo root (PowerShell)
  $env:DATABASE_URL="postgresql://urlshortener:urlshortener@localhost:5432/urlshortener"; cd applications/web; npx prisma migrate deploy
  ```

---

## 4. ✅ Verify the connection

**From `applications/web`:**

```bash
npx prisma db execute --stdin
```

Then type: `SELECT 1;` and press Enter, then Ctrl+D (or Ctrl+Z then Enter on Windows). If the command exits without error, the database is reachable.

Or open **Prisma Studio** to browse data:

```bash
npx prisma studio
```

Opens a UI at http://localhost:5555 (tables, e.g. `ShortenedUrl`).

---

## 📋 Checklist

| Step | Action |
|------|--------|
| 1 | 🐘 Postgres is running (`docker-compose up -d postgres` or local install). |
| 2 | 🔐 `DATABASE_URL` is set in **repo root** `.env` (and in `applications/web/.env` if you run Prisma from there). |
| 3 | 📤 Migrations applied: `cd applications/web && npx prisma migrate deploy`. |
| 4 | 🚀 Restart the app: from repo root, `pnpm dev` (or `npx pnpm dev`). |

**If the app still can't connect, check:**

- 🔌 **Wrong host/port:** With Postgres in Docker, use `localhost:5432` from the host.
- 🔑 **Wrong user/password:** Must match Postgres (e.g. `urlshortener` / `urlshortener` in Docker Compose).
- 🛡️ **Firewall:** Port 5432 allowed for local connections.
