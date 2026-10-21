# Specs - url-shortener

What the service has to do. Tests and commits reference these IDs. For how the code is organised,
see the [Architecture section in the README](./README.md#architecture).

**SPEC-001: Shorten a URL.** The user pastes a URL and gets back `{PUBLIC_URL}/s/{code}`. Shortening
the same URL twice gives two different links, so each one has its own stats.

**SPEC-002: Validate the URL.** Trim the input and add `https://` if there's no scheme. Only http
and https are allowed, max 2048 chars, and it must be a real URL with a hostname. Links to our own
domain are rejected to avoid redirect loops. Each case returns a clear error message.

**SPEC-003: Unique short codes.** 7 random base62 chars generated with a crypto-safe source. The
database enforces uniqueness; on a collision we retry up to 5 times and then fail.

**SPEC-004: Redirect and count clicks.** `/s/{code}` redirects with a 302 (not 301, so browsers don't
cache it and every click counts) and increments the click counter atomically. Unknown or malformed
codes return a 404 page.

**SPEC-005: Stats page.** `/stats` lists the links, newest first, 20 per page: short URL, original
URL, clicks, created date and last click. Shows an empty state when there's nothing yet, and each
link can be copied.

**SPEC-006: Persistence.** PostgreSQL through Prisma, behind a repository port. Migrations run on
startup and data survives a `docker compose down` / `up`.

**SPEC-007: Abuse prevention.** Max 10 links created per minute per IP; beyond that the user gets a
429 and how many seconds to wait. Redirects are not limited.

**SPEC-008: UI.** Reusable components and responsive layout. Loading state on submit, errors shown
under the input without losing what was typed, a copy button on the result, and navigation between
Shorten and Stats. Unexpected errors show a friendly message and never leak details.

**SPEC-009: Docker.** `docker compose up --build` starts Postgres and the app on
`http://localhost:3000`. The app waits for the database to be healthy, and data lives in a named
volume.

**Out of scope:** user accounts, custom aliases, link expiration, detailed analytics (referrer,
country...), distributed rate limiting, dark mode.
