# Persistence

## Why

The current data store is in memory and disappears on restart. The challenge explicitly asks for persistence and a repository pattern or similar abstraction.

## How

Use Prisma with PostgreSQL from the existing Docker Compose stack. Prisma belongs to the web application infrastructure, not the engine.

The repository interface should live in `libs/engine`; the Prisma implementation should live under `applications/web/app/server`.

## Checklist

- [x] Add Prisma dependencies to `applications/web`.
- [x] Add Prisma schema under `applications/web`.
- [x] Configure `DATABASE_URL` usage through server config.
- [x] Create the `ShortUrl` model.
- [x] Add an initial migration.
- [x] Add a Docker-based migration command.
- [x] Create `db.server.ts`.
- [x] Implement `PrismaShortUrlRepository`.
- [x] Map Prisma records to engine domain types.
- [x] Keep Prisma types out of `libs/engine`.
- [x] Verify data survives container restarts.
