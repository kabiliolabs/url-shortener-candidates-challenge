# Proposal

## Why

The current generator (`libs/engine/src/shortened-url.ts`) draws from a 3-character alphabet at length 2, giving only 9 possible codes, and never checks whether a code already exists before storing it - a second URL that happens to generate a previously-used code silently overwrites the first mapping. This is the challenge's headline bug and makes the service unusable past a handful of links.

## What Changes

- Replace `generateShortCode` with a cryptographically random Base62 generator producing 7-character codes (`[A-Za-z0-9]{7}`, ~3.5 trillion combinations), implemented behind the `CodeGenerator` interface introduced in `refactor-backend-architecture`.
- Add a bounded retry loop in the `shortenUrl` use case: on a collision (the repository reports the code already exists), generate a fresh code and retry, up to 5 attempts; after 5 consecutive collisions, fail with `CodeGenerationError`.
- Uniqueness is checked through the `UrlRepository` interface (an existence check), backed today by `InMemoryUrlRepository`; `persistent-storage-with-prisma` later backs the same check with a real database `UNIQUE` constraint.

## Out of Scope

- A database-level `UNIQUE` constraint - this change only adds the retry logic against the repository interface; `persistent-storage-with-prisma` adds the actual DB guarantee.
- Click tracking, listing, input validation, rate limiting, and any UI changes (other changes in this series).

## Capabilities

### New Capabilities

- `short-code-generation`: the guarantee the system makes about a generated short code's format, randomness/non-enumerability, uniqueness at creation time, and its explicit failure mode when uniqueness can't be achieved.

### Modified Capabilities

(none)

## Impact

- `libs/engine/src/infrastructure`: new Base62 `CodeGenerator` implementation, replacing the current one.
- `libs/engine/src/application`: `shortenUrl` gains the collision-retry loop.
- No new dependency - uses Node's built-in `crypto` module for randomness.
