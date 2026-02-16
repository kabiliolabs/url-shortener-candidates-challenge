# Web app (URL Shortener)

This is the React Router application for the URL Shortener.

**Setup, database, Docker, and full documentation:** see the [root README](../../README.md).

- **[DATABASE.md](./DATABASE.md)** — Connecting to PostgreSQL, migrations, Prisma Studio.
- **[BACKEND.md](./BACKEND.md)** — Backend structure, layers, and file layout.
- **[FRONTEND.md](./FRONTEND.md)** — Frontend structure, components, state, hooks, and how it works.

```bash
# From repo root
pnpm dev
```

Tests: `pnpm test` (from this folder). Prisma: `npx prisma migrate deploy`, `npx prisma studio`.
