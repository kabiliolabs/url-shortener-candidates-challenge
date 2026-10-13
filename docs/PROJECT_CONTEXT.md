# Project context

## Objective

Build a reliable URL-shortening product with clear architecture,
production-minded persistence, automated testing, and explainable engineering
decisions.

## Product capabilities

The completed service must:

- create a unique short code for a valid HTTP or HTTPS URL;
- resolve a known code, record the click, and refresh the dashboard while
  retaining its original destination;
- record clicks without losing concurrent updates;
- list created URLs with their click statistics;
- persist data across application and container restarts;
- provide clear loading, success, empty, validation, and error states;
- run through the documented Docker setup.

## Agreed technical decisions

- React 19 and React Router 8 remain the full-stack delivery framework.
- Tailwind remains the styling system; adding a component library is optional,
  not a success criterion.
- Domain and application logic live in `libs/engine` and have no dependency on
  React Router, Prisma, PostgreSQL, or Node filesystem persistence.
- Prisma implements the repository port against PostgreSQL.
- PostgreSQL and the web application run through Docker Compose. PostgreSQL uses
  a named volume and a healthcheck; migrations run before the application serves
  traffic.
- Vitest drives unit tests for domain rules and application use cases. The
  Prisma adapter receives focused integration coverage where practical.
- DDD is applied pragmatically: model the rules and language that matter, but do
  not introduce aggregates, services, or abstractions without a concrete need.

## Priorities

1. Correct create, resolve, refresh, and click-count behavior.
2. Database-enforced uniqueness and atomic updates.
3. Clear dependency boundaries and testable use cases.
4. Important automated tests and robust HTTP error mapping.
5. Accessible, reusable UI with useful feedback.
6. Honest documentation of trade-offs, verification, and AI usage.

## Explicit non-goals

- Authentication, accounts, custom aliases, URL expiration, analytics charts,
  distributed rate limiting, and production deployment are outside this scope.
- The system remains a modular monolith unless operational requirements justify
  a different deployment model.
- The UI should be polished and coherent, but should not displace correctness,
  tests, or Docker reliability.

## Ubiquitous language

- **Short URL**: the persisted record containing a code, destination, creation
  time, and click count.
- **Short code**: the URL-safe public identifier used by the resolve route.
- **Destination URL**: the validated HTTP or HTTPS URL supplied by the user.
- **Click**: one successful resolution of an existing short code through the
  resolve route; the dashboard refreshes after recording it.
- **Collision**: an attempted insert whose short code already exists.

## Acceptance criteria

- Invalid or unsupported URLs are rejected with a meaningful `400` response.
- Abuse throttling returns `429`; missing codes return `404`; unexpected errors
  are logged server-side and exposed as a safe `500` message.
- Code uniqueness is guaranteed by a PostgreSQL unique constraint. Collision
  retries are bounded and tested.
- Click increments use one atomic database update.
- Restarting the web container does not remove records, and restarting the
  database container retains data through its named volume.
- Domain/use-case tests, typecheck, production build, Docker build, migrations,
  and a create/resolve/list smoke flow are run before release.
- `README.md` and `docs/ARCHITECTURE.md` describe the system that actually
  exists, including its known limitations and operational trade-offs.

## Current repository state

Local commit `6376e3e` contains the current draft: JSON-file persistence, basic
validation, click tracking, a simple in-memory rate limiter, and a visual
refresh. Treat it as input to the refactor rather than resetting it. That commit
also contains broad line-ending changes; avoid touching unrelated files unless
the implementation requires it.
