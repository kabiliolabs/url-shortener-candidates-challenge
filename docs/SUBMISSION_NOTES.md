# Submission Notes Draft

This file is a current submission summary for the repository owner to adapt or
transfer to the protected challenge submission artifact.

## Delivered

- Replaced the legacy JSON-file persistence path with Prisma and PostgreSQL.
- Added a database-level unique constraint for short codes and bounded retry
  handling for collisions.
- Introduced domain value objects, explicit errors, repository ports, and
  focused application use cases in `libs/engine`.
- Added atomic click increments and persisted click-event history in the same
  database transaction.
- Added a clean React Router delivery layer with input validation, loading,
  success, empty, generic error, delete-confirmation, and click-history states.
- Added a reusable confirmation dialog and a styled route error boundary that
  does not expose internal error details.
- Added Docker Compose with PostgreSQL health checks, persistent storage, and
  migrations before the web server starts.

## Architecture decisions

The core domain and application code have no dependency on React Router, Prisma,
PostgreSQL, or filesystem APIs. The web application acts as the composition
root: it selects the Prisma repository, cryptographic short-code generator, and
system clock, then exposes them through thin route handlers.

PostgreSQL was selected instead of an in-memory or file-backed store because
unique codes and click counts are concurrent write concerns. Database
constraints and atomic updates provide the final integrity guarantee.

## Verification completed

- Prisma schema validation passed.
- 25 domain and application tests passed across 6 test files.
- Typecheck and production build passed.
- Docker Compose configuration and Docker web-image build passed.
- A Docker smoke test created a URL, resolved a short code, and confirmed one
  persisted click plus one persisted click event in PostgreSQL.

## AI usage

AI was used for codebase exploration, design discussion, implementation
assistance, review support, and verification guidance. All suggested changes
were reviewed and verified by the engineer. See `docs/AI_USAGE.md` for the
full responsible-use statement.

## Current interaction behavior

Resolving `/s/{code}` records the click and returns to the dashboard so the user
can immediately see refreshed statistics. The original destination remains
stored in the database but is not opened automatically by this dashboard flow.
