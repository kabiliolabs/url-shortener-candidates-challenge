---
name: url-shortener-backend
description: Implement or review backend, domain, Prisma, PostgreSQL, Docker, and server-route changes for the URL-shortener product. Do not use for frontend-only styling or component work.
---

# URL shortener backend

Read `../../../docs/PROJECT_CONTEXT.md` and `../../../docs/ARCHITECTURE.md`
before changing backend code. Preserve the existing draft and keep the
solution proportional to the product's requirements.

## Working method

1. State the behavior being changed and add a failing behavioral test.
2. Implement the smallest domain or use-case change without infrastructure
   imports.
3. Add or adapt the Prisma repository and composition root only when required.
4. Map known failures at the HTTP boundary and keep internal details private.
5. Run the narrow test first, then the relevant test suite, typecheck, and build.
6. Update architecture or operational documentation when a decision or trade-off
   changes. Never report unexecuted verification as completed.

## Backend invariants

- The domain/application package never imports Prisma, React Router, PostgreSQL,
  filesystem APIs, or environment configuration.
- PostgreSQL's unique constraint is the final guarantee for short-code
  uniqueness; check-then-insert is not sufficient.
- Collision retries are bounded and can be tested with a deterministic code
  generator.
- Click counting uses a database-side atomic increment.
- Prisma errors are translated inside the infrastructure adapter.
- Routes coordinate HTTP only; business rules belong in use cases.
- Use a shared server-side `PrismaClient`, with lifecycle appropriate to
  development, tests, and production.
- Migrations are versioned and Docker waits for a healthy database before
  applying them or starting the server.

Prefer small fakes for use-case tests. Mock Prisma only when testing translation
logic; use an integration database for behavior that depends on real constraints
or atomic database operations.
