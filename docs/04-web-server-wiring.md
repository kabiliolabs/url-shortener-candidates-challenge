# Web Server Wiring

## Why

Routes should act as adapters, not as business logic containers. This block creates a composition root for config, database and use-case dependencies.

## How

Create `applications/web/app/server` modules for configuration, database setup, repositories and use-case factories.

This layer may depend on `libs/engine`, Prisma and runtime environment. React components should not depend on this layer.

## Checklist

- [x] Create `applications/web/app/server`.
- [x] Add `config.server.ts`.
- [x] Validate required environment variables.
- [x] Add `db.server.ts`.
- [x] Add repository wiring.
- [x] Add use-case dependency wiring.
- [x] Ensure server-only files use `.server.ts`.
- [x] Ensure React components do not import server-only modules.
