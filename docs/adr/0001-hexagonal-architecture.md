# 0001. Hexagonal architecture with the core in `libs/engine`

Status: Accepted

## Context
The original code mixed UI, storage and logic in one place, which made it untestable and tied to in-memory storage.

## Decision
`libs/engine` holds the core in three layers: `domain` (model, value objects, repository ports), `application` (use cases and the remaining ports) and `infrastructure` (adapters). Dependencies point inward only: `infrastructure → application → domain`. The web app is a driving adapter: routes call use cases and nothing else. Adapters are wired in a single server-only composition root (`applications/web/app/.server/container.ts`).

The engine exposes only `./domain`, `./application` and `./infrastructure`.

## Consequences
- Domain and use cases are tested without a database or framework.
- Replacing Prisma, adding a CLI or an API requires no change in the core.
- More files and indirection than a single-module app.
