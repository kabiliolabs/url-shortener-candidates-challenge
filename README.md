# URL Shortener

Shorten URLs, redirect short codes to their destination and track click statistics.

## Docker Setup

Requires Docker with Compose v2. No `.env` needed.

```bash
docker compose up --build
```

Open `http://localhost:3000`. The app waits for Postgres, applies migrations and starts. Data persists in the `db-data` volume (`docker compose down -v` deletes it).

## Local Setup

Requires Node.js 22 and pnpm 10.

```bash
pnpm install
cp .env.example .env
docker compose up -d db
pnpm --filter @url-shortener/engine db:deploy
pnpm dev
```

Open `http://localhost:5173`

## Tests

```bash
pnpm test               # unit tests
pnpm test:integration   # repositories against Postgres (needs docker compose up -d db)
```

## Structure

```
applications/web/   # React Router v7 app: routes, UI, composition root (app/.server)
libs/engine/        # Hexagonal core: domain, application (use cases), infrastructure (Prisma)
```
