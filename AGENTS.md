# Architecture Guide

Keep the project as a small modular monolith with clear boundaries.

## Dependency Direction

```txt
applications/web -> libs/engine
libs/engine -> no application package
```

`libs/engine` is the business core. It must not depend on React, React Router, Prisma, Docker, environment variables or web-specific code.

`applications/web` is the application shell. It owns HTTP delivery, UI, infrastructure, environment configuration and dependency wiring.

## Target Structure

```txt
libs/engine/src/
  short-url/
    application/
    domain/
    ports/
    errors.ts
    index.ts
  index.ts

applications/web/app/
  components/
    ui/
  routes/
  server/
    repositories/
```

## Responsibilities

`libs/engine/src/short-url/domain`

- Domain types and invariants.
- URL and short-code validation.
- No async infrastructure calls.

`libs/engine/src/short-url/application`

- Use cases such as create, resolve and list short URLs.
- Coordinates domain rules and ports.
- Depends only on domain and ports.

`libs/engine/src/short-url/ports`

- Contracts required by use cases.
- Examples: repository, code generator.
- Implemented outside the engine.

`applications/web/app/routes`

- React Router loaders and actions.
- Parse requests, call use cases and map results to responses.
- Should stay thin.

`applications/web/app/components`

- Presentational React components.
- Can depend on route data and UI types.
- Must not depend on repositories, Prisma or server-only modules.
- Wraps Radix primitives behind project-owned components when Radix is used.
- Routes/pages should import project components, not Radix primitives directly.

`applications/web/app/server`

- Environment parsing.
- Database client.
- Repository implementations.
- Dependency wiring for use cases.
- May depend on `libs/engine`, Prisma and runtime environment.

## Resource Ownership

- Environment variables are read only by `applications/web/app/server`.
- PostgreSQL/Prisma belong to `applications/web/app/server`.
- Repository interfaces belong to `libs/engine`; implementations belong to `applications/web`.
- Code generation contracts belong to `libs/engine`; concrete generators can live in `applications/web/app/server` or a small engine implementation if they remain pure.
- React components depend on route-provided data, not on infrastructure.
- Routes can depend on server wiring and engine use cases, but should not directly query the database.

## Rules

- Do not export mutable global state.
- Do not leak Prisma models into `libs/engine`.
- Do not put business logic in React components.
- Prefer small use cases over generic service layers.
- Add tests around engine use cases and domain rules when behavior changes.
- Keep Docker as the only supported local runtime.
