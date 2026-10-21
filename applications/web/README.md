# web

React Router v7 application: HTTP adapters (routes), UI components and the
infrastructure implementations (Prisma repository, rate limiter, configuration).

The domain and the use cases live in [`libs/engine`](../../libs/engine).
See the [root README](../../README.md) for setup, Docker and architecture.

## Scripts

| Script             | What it does                                                   |
| ------------------ | -------------------------------------------------------------- |
| `dev`              | Dev server with HMR on port 5173                               |
| `build` / `start`  | Production build / serve (`start` runs `prisma migrate deploy`) |
| `typecheck`        | `react-router typegen` + `tsc`                                 |
| `db:migrate`       | Create & apply a migration against the local SQLite file        |
| `db:generate`      | Regenerate the Prisma client                                    |
| `db:studio`        | Open Prisma Studio against the local database                   |
