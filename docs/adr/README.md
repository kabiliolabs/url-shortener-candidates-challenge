# Architecture Decision Records

Short records of decisions that shape the codebase. Format: context, decision, consequences.
Add a new ADR instead of rewriting an accepted one; mark the old one as superseded.

| ADR | Decision |
| --- | --- |
| [0001](0001-hexagonal-architecture.md) | Hexagonal architecture with the core in `libs/engine` |
| [0002](0002-unique-codes-via-primary-key.md) | Short code uniqueness enforced by the primary key with retries |
| [0003](0003-clicks-as-append-only-records.md) | Clicks are append-only records; counts are computed |
| [0004](0004-redirect-survives-click-failure.md) | A redirect never fails because click recording failed |
| [0005](0005-typed-errors-translated-at-adapters.md) | Typed errors in the core, translated to HTTP at the adapter |
| [0006](0006-postgres-and-prisma.md) | PostgreSQL with Prisma 7 and versioned migrations |
| [0007](0007-docker-runtime.md) | Docker runtime: migrations on startup, hardened image |
| [0008](0008-ui-primitives-and-stats-route.md) | Hand-written UI primitives and stats on their own route |
| [0009](0009-default-scheme-in-web-adapter.md) | Default https scheme added in the web adapter, domain stays strict |
