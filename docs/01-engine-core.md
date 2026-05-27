# Engine Core

## Why

The current business logic is spread across React Router routes and mutable global state. This block creates a clear core that can be tested without React, Prisma or Docker.

## How

Restructure `libs/engine` around the `short-url` domain. Keep this package pure: domain rules, use cases, ports and expected application errors only.

Follow the boundaries defined in `AGENTS.md`: the engine must not import React, React Router, Prisma, Docker, environment variables or web-specific code.

## Checklist

- [x] Create the `libs/engine/src/short-url` structure.
- [x] Add domain types for short URLs, original URLs and short codes.
- [x] Add URL validation and normalization rules.
- [x] Add short-code validation rules.
- [x] Generate unique short codes with collision handling.
- [x] Define expected application errors.
- [x] Define `ShortUrlRepository` port.
- [x] Define `CodeGenerator` port.
- [x] Implement `createShortUrl` use case.
- [x] Implement `resolveShortUrl` use case.
- [x] Implement `listShortUrls` use case.
- [x] Remove `baseUrl` from the engine.
- [x] Stop exporting mutable global state from the engine.
- [x] Export the new public API from `libs/engine/src/index.ts`.
