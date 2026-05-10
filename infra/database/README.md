# @url-shortener/database

Shared database package providing a configured **Prisma client** (PostgreSQL) and **Redis client** (ioredis), plus a `disconnectAll()` utility for graceful shutdown.

## Exports

```ts
import { prisma, redis, disconnectAll } from "@url-shortener/database";
```

## Schema

The Prisma schema lives at `prisma/schema.prisma` and defines:

- **ShortenedUrl** — stores short codes and their original URLs
- **Click** — tracks individual click events per shortened URL

## Adding a New Model

1. Define the model in `prisma/schema.prisma`
2. Create a migration:
   ```bash
   pnpm --filter @url-shortener/database db:migrate:dev
   ```
3. The Prisma client is regenerated automatically during migration

## Scripts

| Script             | Command                | Description                                |
| ------------------ | ---------------------- | ------------------------------------------ |
| `db:migrate:dev`   | `prisma migrate dev`   | Create and apply a migration (development) |
| `db:migrate:deploy`| `prisma migrate deploy`| Apply pending migrations (production)      |
| `db:generate`      | `prisma generate`      | Regenerate the Prisma client               |
| `db:studio`        | `prisma studio`        | Open Prisma Studio GUI                     |
| `db:reset`         | `prisma migrate reset` | Drop database and re-apply all migrations  |
| `build`            | `prisma generate && tsc` | Generate client and compile TypeScript   |
