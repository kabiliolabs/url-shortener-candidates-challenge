# Short-code generation and persistence

## Goal

Create short links without overwriting existing destinations, including when multiple users or application instances submit requests concurrently. Store links in PostgreSQL so creation and resolution share the same persistent data.

## Scope

- Replace the current two-character generator with Nano ID.
- Introduce an injectable code generator and a shortener repository abstraction, with a PostgreSQL adapter using the existing database package and Drizzle.
- Connect both shortening and resolution use cases to PostgreSQL, including module-owned schema, explicit migrations, runtime configuration, and Docker wiring.
- Handle collisions and database outages through the existing HTTP and form feedback paths.
- Add deterministic use-case tests, route/form tests, and real PostgreSQL integration tests.

Out of scope: URL deduplication, custom aliases, user accounts or ownership, expiration, statistics, abuse controls, and UI redesign. Existing validation and redirect behavior remain unchanged except for the storage failure responses defined below.

This feature supersedes the earlier use-case and database-foundation specifications' temporary exclusions of repository integration, persistence, and collision handling. The database package remains generic.

## Requirements

### Code generation and uniqueness

- Use Nano ID's secure generator to produce exactly 10 case-sensitive alphanumeric characters: `0–9`, `A–Z`, and `a–z` (62 possible characters per position).
- Generate only after destination validation succeeds. Invalid input must not generate a code or write to storage.
- Every successful submission creates an independent short link, even when its destination matches an existing link. Do not deduplicate or derive the code from the destination.
- Enforce global, case-sensitive code uniqueness in PostgreSQL. Uniqueness applies to the code itself, not a combination of code and user or destination.
- Attempt an atomic insert; do not rely on a separate existence check for correctness. A conflict must never update, replace, or delete the existing link.
- Allow at most **3 total generation-and-insert attempts**, including the initial attempt. After a code uniqueness conflict, generate a fresh candidate and attempt another insert. Do not deliberately reuse the conflicting candidate.
- Retry only conflicts on the short-code uniqueness constraint. Other database failures stop the operation immediately; they must not enter the collision retry loop.
- Return success only after the insert succeeds. If all three attempts collide, return the controlled exhaustion error below, with existing records unchanged.

### Architecture and persistence

- Keep shortener domain rules in the existing module. Use cases depend on injectable generator and repository interfaces; Nano ID, Drizzle, and PostgreSQL belong in adapters under `libs/engine/src/modules/url-shortener/infrastructure`, outside domain and application logic. Export infrastructure through a separate engine package subpath; core exports must not import infrastructure vendors.
- Use the shared `Result` contract for expected application failures. Translate database-specific outcomes in the adapter and application errors to HTTP responses in the routes.
- Adapt both use cases and their route callers to asynchronous persistence. Construct the database, repository, generator, and use cases explicitly, one by one, in web’s `app/bootstrap.server.ts`; do not introduce a separate assembly factory or layer. Keep environment configuration, database lifecycle, and shared application instances in that bootstrap function, which returns configured use cases and database cleanup. Cleanup must not initialize an unused database and is terminal for that application instance. The bootstrap preserves lazy initialization and reuses the database connection pool rather than creating one per request.
- PostgreSQL is the sole runtime store for creation and resolution. Do not silently fall back to the in-memory Map when storage fails.
- Persist the code and validated destination without changing destination normalization. Successful links must remain resolvable across application and PostgreSQL restarts with the database volume retained.
- Keep shortener schema alongside the module’s persistence adapter in engine infrastructure. Web owns Drizzle configuration, migration files, and migration execution. Keep the generic database package unchanged. Apply migrations through an explicit command; do not migrate on import, client construction, or web startup.
- Update environment documentation, setup commands, and Docker packaging/configuration so both host-run and container-run applications can use PostgreSQL. Preserve existing public URL configuration and the `/s/:code` route.
- Preserve exact lookup semantics: do not trim or change the case of supplied codes. The 10-character format restricts newly generated codes only; existing stored codes remain resolvable regardless of their length or alphabet.

### HTTP and user feedback

| Outcome | HTTP behavior |
| --- | --- |
| Successful shortening | Preserve HTTP 200 and `{ shortenedUrl }` using the configured public prefix. |
| Invalid destination or code | Preserve existing HTTP 400 messages and error contracts. |
| Three code collisions | HTTP 503: `Could not create a short link. Please try again.` |
| Database unavailable during shortening or resolution | HTTP 503: `Service temporarily unavailable. Please try again.` |
| Successful resolution | Preserve HTTP 302 and the exact stored destination. |
| Successful lookup with no matching record | Preserve HTTP 404 `Not Found`. |

- The existing form displays shortening errors and preserves the entered URL. A failed submission must not display a stale successful result as if the submission succeeded.
- The home page remains accessible while PostgreSQL is unavailable. Do not require a successful database query or health check to render it.
- A database outage must not be reported as a missing link. Do not expose database details or credentials in public error messages.

### Verification

- Use injected generators and repositories to force collisions deterministically. Do not depend on naturally occurring Nano ID collisions or probabilistic tests.
- Extend the existing Vitest, route integration, and React Testing Library tests. Use isolated real PostgreSQL tests to prove the adapter's uniqueness enforcement, concurrency behavior, and persistence.
- Keep test-owned databases and resources separate from developer data and clean them up. An unavailable Docker/PostgreSQL environment is unverified coverage, not a passing test.

## Acceptance criteria

1. New codes contain exactly 10 characters from the agreed alphabet. Invalid destinations retain their current errors and cause no generation or storage mutation. Repeated submissions of a valid destination create distinct stored links.
2. Deterministic tests cover immediate success, success after one collision, success on the third attempt, and exhaustion after three collisions. They verify generation/insert counts, stored results, and preservation of every pre-existing conflicting record. No fourth attempt occurs.
3. A noncollision database failure stops immediately, including when it follows a collision. It is not mistaken for a uniqueness conflict, exhaustion, or a missing link. Outage responses use the agreed HTTP 503 message.
4. Real PostgreSQL tests submit competing inserts for the same code. At most one succeeds; the other reports a code conflict, and the winning destination is not overwritten. Separate case-distinct codes can coexist and resolve exactly.
5. A created link resolves to the same destination after application restart and PostgreSQL restart with the volume retained. Existing stored codes outside the new generation format still resolve; genuinely missing codes retain HTTP 404.
6. Route/form tests verify both HTTP 503 messages, preservation of the entered URL, and removal of stale success feedback. The home page remains accessible during an outage, while unavailable resolution returns 503 rather than 404. Existing successful shortening, validation, and redirect tests continue to pass.
7. The production schema and explicit migration workflow work against isolated PostgreSQL, including repeat application without losing records. Host and Docker setup can create and resolve links using the same configured database. No automatic migrations or in-memory fallback are introduced.
8. `pnpm test`, `pnpm typecheck`, and `pnpm build` pass. Keep application tests colocated with their source files; do not add a separate `applications/web/tests` directory or web integration runner. Verify the real-database acceptance criteria separately; `pnpm test:database` covers only the generic database foundation. Record unavailable checks explicitly.
