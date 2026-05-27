# Engine Tests

## Why

The challenge asks for maintainable code and tests for important parts. The engine is the cheapest and most valuable place to test because it contains the business rules.

## How

Add Vitest and test use cases with in-memory fakes. Do not require PostgreSQL or Docker services to test the engine behavior.

Tests should document the expected behavior of the core before web and persistence adapters are added.

## Checklist

- [x] Add Vitest to the workspace.
- [x] Add `test` scripts to the root and engine package.
- [x] Configure Turbo to run tests.
- [x] Create an in-memory repository fake for engine tests.
- [x] Test URL validation failures.
- [x] Test short URL creation.
- [x] Test code collision retry behavior.
- [x] Test successful short-code resolution.
- [x] Test missing short-code resolution.
- [x] Test click count increment behavior.
- [x] Verify tests run through Docker.
