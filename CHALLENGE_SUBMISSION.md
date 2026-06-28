# Submission

## What I did

When I first read the brief, my instinct was to reach for the most impressive stack I could justify: Postgres, Redis, shadcn, full DDD. Then I re-read it: *~2 hours, it doesn't need to be perfect, prioritize.* That reframing changed everything. The goal was to make deliberate engineering decisions under constraints and explain them clearly. So that's what I tried to do.

I refactored the starter app into a working, Docker-verified URL shortener with persistent storage, unique short codes, click tracking, input validation, abuse prevention, and a clean UI. Below is how I thought through each decision.


## Decision log

### The starting point: what was actually broken

The first thing I do with any unfamiliar codebase is read it before touching it. Not to judge it, but to understand what it was trying to do and where it fell apart.

This one had a clear shape: a URL shortener that worked in theory but not in practice. The problems were real, but they weren't all the same kind of problem. Some were cosmetic. Some were architectural. One made the whole thing non-functional by definition.

The storage was a plain JavaScript `Map` in memory. That single decision means every URL ever created disappears on restart. Not a bug, not an edge case: the service cannot fulfill its core promise. A URL shortener that forgets its URLs is not a URL shortener. Everything else is secondary to fixing this.

The code generator compounded the problem. It worked from an alphabet of 9 characters. With a fixed-length code of 4, that gives at most 9^4 = 6,561 unique combinations before collisions become inevitable. A moderately active service exhausts that in hours. Even with persistence in place, the generation strategy would need to change.

The architecture made both problems harder to fix than they should have been. The in-memory Map lived in the same module imported directly by route handlers. There was no boundary between "how data is stored" and "how requests are handled." Swapping the Map for a database meant touching every route that referenced it.

Validation was absent entirely. The form passed raw input straight to the generator. No length check, no format check, no protocol restriction. `javascript:alert(1)` would have produced a valid short code.

And the redirect was blind. It sent users to their destination with no record of the visit. No counter, no timestamp, no signal that the URL had ever been used.

The UI was the least urgent issue: inconsistent fonts, clashing colors, no hierarchy. Worth fixing, but it does not affect whether the service works.

With this diagnosis, I had a clear picture of what needed solving and in what order. Before deciding how to solve each one, I mapped the realistic options:

| Problem | Fix proposals |
|---|---|
| Poor UI | Tailwind is zero setup. shadcn or Radix adds accessible components with more structure. MUI is consistent at scale but too heavy for one screen. |
| Code generation | Hash-based deduplicates identical URLs but collides at short prefix lengths. Auto-increment guarantees uniqueness but codes are sequential and reveal usage. Random base62 is opaque and stateless, with bounded retries for the rare collision. |
| Separation of concerns | Flat queries in routes are simple but leak storage into request handling. A repository in the engine creates a clean boundary with minimal overhead. Full DDD maximises decoupling but introduces ceremony this scope does not justify. |
| Persistence | PostgreSQL is production-grade but requires a separate service. MongoDB adds schema flexibility this stable model does not need. SQLite is file-based, zero infrastructure, and persists via a Docker volume. |
| Error handling | Ad-hoc try/catch is fast but inconsistent and leaks internals to the client. Zod validates input shape well but does not cover domain errors. A typed error hierarchy handles both and maps cleanly to HTTP status codes. |
| Click statistics | A separate event table enables rich analytics but is overkill for a counter. Fire-and-forget async is faster but risks losing counts on failure. A synchronous counter on redirect is simple and always consistent. |


### Persistence: SQLite over Postgres

The data model here is as stable as it gets: one table, one row per short URL, a handful of fields. There is no schema uncertainty that would justify a document database, and no traffic volume that would justify the operational overhead of a separate Postgres service in Docker.

SQLite is file-based. The entire database is a single file on disk. In Docker, a bind mount to `./data` is all it takes to make it persistent across restarts. Migrations run with one command on startup. No connection management, no separate container, no credentials to wire up.

The honest tradeoff is horizontal scale. SQLite breaks the moment you need multiple nodes writing concurrently. For a single-node deployment, that tradeoff does not exist. Choosing Postgres here would be optimising for a problem this setup cannot have.

When the service needs to scale horizontally or support concurrent writes across nodes, Postgres is the answer. The repository boundary in the engine means that migration is a provider swap in Prisma, not an application rewrite.

Prisma was the natural ORM choice: type-safe queries, clean migration tooling, and first-class TypeScript support.


### Code generation: random base62

The starter used 9 characters and short codes. The math is simple: 9^4 gives 6,561 combinations. That is not a code space, it is a waiting room for collisions.

The replacement needed to be stateless, opaque, and collision-resistant at realistic scale. Hash-based generation is deterministic, which is useful for deduplication, but two different URLs can produce the same truncated prefix and the detection logic adds complexity. Auto-increment IDs encoded in base62 have no collisions by definition, but sequential codes expose usage patterns to anyone watching.

Random base62 avoids both problems. Cryptographically random bytes mapped to the 62-character alphabet `a-z A-Z 0-9`, truncated to 7 characters, gives roughly 3.5 trillion combinations. The probability of a collision at any realistic usage volume is negligible. When one does occur, a bounded retry of up to 5 attempts handles it cleanly. If all 5 fail, a controlled error surfaces rather than an infinite loop.

Why 7 characters and not 6? Six gives 56 billion combinations, which is enough. Seven gives 3.5 trillion and matches the conventional length used by services like bit.ly. The extra character costs nothing.

Why base62 and not base64? Base64 includes `+` and `/`. The slash is a path separator in URLs. The plus sign is decoded as a space in query strings. Both characters break short codes without additional encoding. Base62 stays clean in any URL context without escaping. I used [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986) as a reference to validate this reasoning: it defines `+` and `/` as reserved characters in URI syntax, which reinforced the decision even though the practical consequence is straightforward enough to reason about directly.


### Redirect: 302 over 301

Every redirect in a URL shortener is a choice between performance and control.

A 301 tells the browser the move is permanent. After the first visit, the browser skips the server entirely and goes directly to the destination. That is faster, but it makes click counting impossible for any returning visitor, and it makes updating or expiring a URL a problem that cannot be solved without asking users to clear their cache.

A 302 tells the browser the redirect is temporary. Every visit passes through the server. That single pass is where the click counter increments, where expiration logic can run, and where the destination can be changed without side effects.

The service is supposed to track clicks. 301 breaks that by design. 302 is the correct answer.


### Architecture: Repository pattern in the engine

The original code had no boundary between persistence and request handling. The in-memory Map was imported directly by routes. That coupling meant changing storage meant changing routes.

The monorepo already defines a boundary: `libs/engine` for domain and persistence logic, `applications/web` for the web layer. The right move was to respect that boundary, not work around it.

The engine exports a small set of typed functions: `createShortUrl`, `getShortUrlByCode`, `recordClick`, `listShortUrls`. Routes call those functions and never touch Prisma directly. The backing store is invisible to the web layer.

I kept it at that. No ports and adapters, no use case classes, no full DDD ceremony. A clean boundary is enough. The rule of thumb: add abstraction when it removes friction, not when it demonstrates architecture.


### Error handling: typed error hierarchy

The original code had no error handling. Any failure would have surfaced as an unhandled exception or, worse, leaked raw Prisma internals directly to the client.

Ad-hoc try/catch leaks internals under pressure. Zod covers input shape but not domain failures like missing records or rate limit breaches. A typed error hierarchy covers both in one coherent model.

The hierarchy I chose is small by design:

```
AppError
|-- ValidationError   (400)
|-- NotFoundError     (404)
|-- ConflictError     (409)
`-- RateLimitError    (429)
```

Each class carries a machine-readable `code` and a human-readable message. Routes catch `AppError` subclasses and map them to the appropriate HTTP status. Anything that is not an `AppError` becomes a generic 500 with a safe message. Nothing internal reaches the client.

The practical benefit is not just safety. Every error the application can produce is now named, which makes them easy to test, easy to document, and easy to extend without touching the route layer.


### Validation: what the server accepts

The original code accepted anything. No length check, no format check, no protocol restriction.

Server-side validation runs before any database operation. The rules are simple but each one exists for a reason.

Trimming whitespace and rejecting empty input catches the most common accidental submissions. Capping length at 2048 characters follows the practical limit most browsers and servers impose on URLs and prevents oversized payloads from reaching the database. Parsing with the native `URL` constructor rejects anything that is not a structurally valid URL. Restricting to `http:` and `https:` blocks `javascript:` protocol injections, `data:` URIs, and any other scheme that could be weaponised through a redirect.

Each failure returns a specific message explaining what went wrong, not a generic error.


### Rate limiting: in-memory, documented as demo-grade

Without any rate limiting, the shorten endpoint is open to abuse: a single client could flood the database with thousands of entries in seconds.

The production answer is a Redis-backed sliding window shared across all instances, but that introduces a new service dependency and infrastructure complexity that is not justified here. The pragmatic answer is an in-memory Map keyed by IP address with a fixed window that resets on expiry. It costs around 15 lines of code, works correctly on a single instance, and adds no dependencies.

The honest limitations: it does not survive server restarts and does not coordinate across multiple processes. Both are documented explicitly. Redis is the documented upgrade path when either condition matters.

Limit: 10 requests per IP per 60 seconds.


### UI: Tailwind, no component library

The UI had one job: make the service usable without getting in the way of the core functionality.

Tailwind was already configured in the project, which made it the natural starting point. shadcn or Radix would have added accessible primitives and more structure, but both require setup time and configuration decisions that consume time without improving what the service actually does. A clean Tailwind interface delivers the same result with none of that overhead.

The result is one screen: a URL input with a loading state, inline validation errors, a success panel with the shortened URL and a copy button, a table of recent URLs with click counts and timestamps, and an empty state when no URLs exist. Error and success regions use aria-live so screen readers catch updates. Submit is disabled while a request is pending.


### Singleton PrismaClient

Every time React Router hot-reloads in development, it can create a new PrismaClient instance. Each instance opens a new database connection. Left unchecked, this causes file lock errors with SQLite and connection pool exhaustion with Postgres.

The fix is one pattern: store the client on `globalThis` so it survives reloads instead of being recreated on each one.

```ts
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

In production a single instance is created at startup. In development the same instance is reused across reloads. Small detail, real consequence.


### Docker: treated as an acceptance criterion

The brief is explicit: the solution must run on Docker. I treated `docker-compose up --build` as the acceptance test, not a final checkbox.

Three things needed to be right. First, the SQLite file had to survive container restarts, which meant mounting `./data` on the host rather than writing inside the container. Second, the schema had to be in sync with the code on every startup, so the entrypoint runs `prisma migrate deploy` before the app starts. Third, generated short URLs had to point to the correct host in any environment, not just localhost, which is why `PUBLIC_URL` is an environment variable rather than a hardcoded value.


## What I would do with more time

Two hours is enough to get the core right. It is not enough to get everything right.

The first thing I would add is tests. The engine functions are pure and typed precisely so they are easy to test, but I did not have time to write them. URL validation edge cases, collision retry behavior, and repository integration tests against a real SQLite file are the highest-value coverage.

After that, the in-memory rate limiter needs a proper replacement. It works on a single instance but does not survive restarts and cannot coordinate across processes. Redis with a sliding window is the correct upgrade and the path is already documented in the code.

Further out: URL expiration via an `expiresAt` field on the schema, SSRF protection to reject URLs pointing to private IP ranges, and custom aliases so users can choose their own short code. The schema already supports the last one; it is mostly a UI and validation addition.

None of this changes what was delivered. It is the honest gap between a working solution and a production-ready one.


## AI usage

I used Claude throughout this work, with most of the value coming before a single line of code was written.

Claude can read a codebase, pull in external references and established patterns, and map out every realistic scenario for a given decision in a fraction of the time it would take to research independently. We went through each problem in the starter code together: what the options were, what each one costs, and which made the most sense given the constraints. That analysis compressed hours of research and deliberation into a focused conversation that produced a clear plan before implementation started.

The conclusions were mine. Claude surfaced the tradeoffs, I chose the path. The brief says AI is permitted and encouraged. This is exactly the kind of leverage it should provide.


## Feedback

The challenge is well-structured. Starting from a broken codebase rather than a blank slate forces real diagnosis before real decisions, which is closer to actual engineering work.

One suggestion: the brief mentions Radix/shadcn as a consideration for the frontend, which reads closer to a recommendation than a suggestion. That framing might push candidates toward component library setup at the cost of core functionality. Clarifying that clean UI is the goal, not any specific library, would help candidates spend their time better.
