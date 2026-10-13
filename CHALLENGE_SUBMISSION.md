# Challenge submission

## What I Did

I prioritised the core product flow and the architecture behind it: create a
short link, redirect it reliably, persist it across restarts, and count clicks.

- Replaced the collision-prone `abc`/two-character generator with secure,
  URL-safe 8-character codes plus a uniqueness check.
- Added `ShortenedUrl` as a domain model and `UrlRepository` as a persistence
  boundary. `FileUrlRepository` provides atomic JSON persistence for the timed
  challenge and is isolated enough to replace with Prisma/PostgreSQL later.
- Added HTTP(S) URL validation, length limits, useful error feedback, loading
  feedback, and a lightweight per-client rate limit.
- Added a clean responsive UI with a link list, original URL, creation date,
  and click statistics.
- Redirects now record a click before redirecting. Docker persists data in a
  named volume.
- Verified with `pnpm typecheck` and `pnpm build`.

## What I Would Do With More Time

With more time I would replace the file repository with Prisma/PostgreSQL,
add migrations and a real database-backed atomic increment, add automated unit
and integration tests, and add structured logging/observability. I would also
move rate limiting to a shared store such as Redis, add abuse controls around
destination domains, and add authentication/ownership if this became a
multi-user product.

## AI Usage

I used AI as a coding partner for repository inspection, architecture review,
implementation, and verification. I asked it to identify the highest-value
changes for the two-hour constraint, propose a repository boundary, implement
the refactor, and review the result against the requirements. I then inspected
the generated code, made the final trade-offs myself, and ran the project's
typecheck and production build. AI did not replace understanding: the key
decisions are documented above and should be explainable from the code.

## Feedback

The challenge is clear and appropriately scoped for prioritisation. One useful
addition would be a minimal API contract or expected persistence choice, since
the two-hour limit makes the trade-off between a production database and a
dependency-light repository significant.
