# 0007. Docker runtime: migrations on startup, hardened image

Status: Accepted

## Context
The project must run with a single `docker compose up --build`, with no manual steps.

## Decision
- `web` waits for the `db` healthcheck, runs `prisma migrate deploy`, then starts the server.
- Multi-stage image on Node 22 LTS, running as the non-root `node` user, with `tini` as PID 1 and `exec` into the server so SIGTERM triggers a graceful shutdown.
- No `.env` is baked into the image; compose provides configuration with defaults.

## Consequences
- Zero-step setup for reviewers.
- Migrating on startup is fine for one replica. For production: run migrations as a separate deploy step, ship an image without devDependencies, and inject secrets from the platform.
