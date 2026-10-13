# Architecture

## Intent

The design establishes clean boundaries while remaining proportional to the
product's current scope. It uses ports and use cases where they improve testing
or isolate volatile technology, not as ceremony.

## Architectural principles

- **Domain-Driven Design:** domain language, invariants, value objects, explicit
  errors, and application use cases model the product's business behavior.
- **Clean Architecture:** dependencies point inward. Domain and application code
  remain independent from HTTP, React Router, Prisma, PostgreSQL, and other
  infrastructure details.
- **Test-Driven Development:** domain rules and application behavior are built
  through a red-green-refactor cycle that starts with a failing behavioral test.

```text
React Router routes and UI
            |
            v
Application use cases  ---> domain model and domain errors
            |
            v
      UrlRepository port
            ^
            |
Prisma adapter ---> PostgreSQL
```

## Dependency rule

`libs/engine` contains domain and application code. It may use platform-neutral
TypeScript but cannot import React Router, Prisma, PostgreSQL, environment
variables, or filesystem APIs. The web application owns delivery adapters,
infrastructure adapters, and the composition root that wires implementations to
use cases.

## Responsibilities

### Domain

- Represent and validate destination URLs and short codes.
- Represent a short URL and its invariants.
- Define stable domain errors and vocabulary.

### Application

- Create a short URL, retrying bounded code collisions.
- Resolve a short code and record its click.
- List short URLs for the statistics view.
- List click events for the expandable click-history view.
- Depend on ports such as `UrlRepository`, `ShortCodeGenerator`, and `Clock`
  only when they make behavior deterministic or isolate infrastructure.

### Infrastructure

- Implement `UrlRepository` with Prisma.
- Translate Prisma-specific failures into application/domain errors.
- Rely on PostgreSQL for the unique-code constraint and atomic click increment.
- Own the reusable server-side `PrismaClient` lifecycle.

### Delivery

- Parse form data and route parameters.
- Determine client identity for the local abuse-control policy.
- Invoke use cases and map known errors to HTTP status codes.
- Render accessible pending, success, empty, and error states.
- Never query Prisma directly from a route or component.

## Main flows

### Create

1. The action parses the submitted destination URL and applies rate limiting.
2. The create use case validates the destination and asks the generator for a
   code.
3. The repository inserts the record. PostgreSQL is the final authority on
   uniqueness.
4. A unique-constraint collision causes a bounded retry with a new code.
5. The action maps success or a known failure to an intentional HTTP response.

### Resolve, count, and refresh

1. The loader validates the public code and invokes the resolve use case.
2. The repository atomically increments `clicks` and records a `ClickEvent` in
   the same transaction.
3. A missing code becomes `404`; a known record returns to `/` so the dashboard
   can render the updated count and click history. The resolved destination is
   retained by the use case and repository, but this dashboard interaction does
   not navigate the browser away from the application.

### List

The index loader invokes the list use case and returns newest records first.
Presentation-specific URL construction stays in the delivery layer.

## Error policy

Expected failures use explicit errors, including invalid destination, invalid
code, collision exhaustion, missing short URL, and rate limit exceeded. Routes
map them to `400`, `404`, `409` or `429`. Unexpected infrastructure failures are
logged and return a generic `500` response; database details never reach users.

## Security scope

The application accepts only HTTP/HTTPS destinations, caps input length,
validates short-code shape, bounds collision retries, and throttles creation requests.
Trust of forwarded IP headers must be explicit. The shortener does not fetch the
destination, so SSRF is not part of this flow; phishing prevention, accounts,
and distributed rate limiting remain documented production concerns.

## Testing strategy

- Domain tests cover validation and invariants.
- Use-case tests use in-memory fakes plus deterministic generators and clocks.
- Repository integration tests cover unique constraints, persistence, ordering,
  and atomic increments against PostgreSQL when feasible.
- HTTP/component tests focus on status mapping and critical feedback behavior,
  rather than duplicating use-case tests.

## Trade-offs

PostgreSQL adds Docker and migration setup compared with SQLite, but provides
relational integrity and safer concurrent writes. A repository port keeps this
decision outside the domain. An in-process rate limiter supports the current
single-instance deployment but would move to a shared store such as Redis in a
horizontally scaled system.
