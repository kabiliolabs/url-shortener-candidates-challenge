# Spec — 2-hour challenge

Source: [proposal.md](./proposal.md), "2h scope" items 1–7. "With more time" items are out of scope.

Terms:
- **Short link**: the full public URL, `{PUBLIC_URL}/s/{code}`
- **Code**: the path segment that identifies a short link
- **Original URL**: the URL the user submitted

---

## R1 — Shorten a URL

The system SHALL create a short link for a valid submitted URL and show it to the user.

- **GIVEN** a valid URL `https://example.com/page`
  **WHEN** the user submits it
  **THEN** a short link `{PUBLIC_URL}/s/{code}` is shown, and following it leads to `https://example.com/page`.
- **GIVEN** a URL that was already shortened
  **WHEN** it is submitted again
  **THEN** a new, different code is created, and both short links work independently with separate stats.
- **GIVEN** the data store is unavailable
  **WHEN** the user submits a valid URL
  **THEN** a generic error message is shown, no short link is shown, and no internal details (stack traces, SQL) are exposed.

## R2 — Unique, unguessable codes

Every code SHALL be 7 characters from `[0-9A-Za-z]`, unique across all stored links, and not derivable from the original URL or from creation order.

- **GIVEN** an existing short link with code `X`
  **WHEN** any number of new links are created
  **THEN** `X` still leads to its original URL; existing links are never overwritten or reassigned.
- **GIVEN** a newly generated code collides with an existing one
  **WHEN** the link is being created
  **THEN** the system retries with a new code, and the user sees a normal success result.
- **GIVEN** a unique code cannot be generated after the retry limit
  **WHEN** the link is being created
  **THEN** a meaningful error is shown and nothing is stored.
- **GIVEN** two links created one after the other
  **WHEN** their codes are compared
  **THEN** neither code can be predicted from the other (no sequential or incrementing pattern).

## R3 — Input validation

The system SHALL reject invalid input with a message shown next to the URL field. No link is created.

Before validating, the system SHALL trim leading and trailing whitespace from the input. It SHALL then parse the URL with the standard WHATWG URL parser. The **parser's own rewritten form of the URL** is what gets validated, stored, shown and redirected to, never the raw input. No normalization beyond what the parser does is applied.

- **GIVEN** the input `  https://example.com/page  `
  **WHEN** submitted
  **THEN** it is accepted and stored as `https://example.com/page`.
- **GIVEN** the input `HTTPS://Example.COM:443`
  **WHEN** submitted
  **THEN** it is stored as `https://example.com/` (lowercase scheme and host, default port dropped, trailing slash on a bare domain).
- **GIVEN** the input `https:\\evil.com\path`
  **WHEN** submitted
  **THEN** it is stored as `https://evil.com/path`, the same URL a browser would open. The redirect goes exactly where validation says it does.
- **GIVEN** a URL with a tab or newline inside it
  **WHEN** submitted
  **THEN** the characters are removed the way a browser removes them, and the resulting URL is what gets validated (e.g. `java\nscript:alert(1)` is rejected as a disallowed scheme).
- **GIVEN** the input `https://www.example.com/a?utm_source=x&b=2#section`
  **WHEN** submitted
  **THEN** it is stored with `www.`, the query parameters in their original order, and the fragment all kept (no semantic normalization).

- **GIVEN** an empty or whitespace-only input
  **WHEN** submitted
  **THEN** the message says a URL is required.
- **GIVEN** input that is not a parseable absolute URL (e.g. `not a url`)
  **WHEN** submitted
  **THEN** the message says the URL is invalid.
- **GIVEN** a URL with a scheme other than `http` or `https` (e.g. `javascript:alert(1)`, `ftp://x.com`, `data:text/html,...`)
  **WHEN** submitted
  **THEN** the message says only http and https URLs are allowed.
- **GIVEN** a URL whose normalized form is longer than the maximum length (see OQ1)
  **WHEN** submitted
  **THEN** the message states the maximum length. The length is measured after normalization, because percent-encoding can make the URL longer than what was typed.
- **GIVEN** a URL with the same host (hostname and port) as `PUBLIC_URL`, with any scheme or path (e.g. `{PUBLIC_URL}/s/abc1234`, `{PUBLIC_URL}/urls`)
  **WHEN** submitted
  **THEN** the message says links to this service cannot be shortened.
- **GIVEN** `PUBLIC_URL=http://localhost:3000` and the input `http://LOCALHOST:3000/x`
  **WHEN** submitted
  **THEN** it is rejected as a self-link (hostnames are compared case-insensitively).
- **GIVEN** `PUBLIC_URL=https://sho.rt` and the input `https://www.sho.rt/x` or `http://localhost:3000/x`
  **WHEN** submitted
  **THEN** it is accepted. Only the exact `PUBLIC_URL` host counts as a self-link; subdomains, other ports, loopback and private addresses are not blocked in this scope.
- **GIVEN** a protocol-relative input `//evil.com`
  **WHEN** submitted
  **THEN** it is rejected as invalid (not treated as a relative path or an implicit scheme).
- **GIVEN** a rejected submission
  **WHEN** the error is displayed
  **THEN** the user's original input (not the normalized form) stays in the field so it can be corrected.

## R4 — Redirect

`GET /s/{code}` SHALL redirect to the original URL when the code exists, and show a not-found page otherwise.

- **GIVEN** an existing code
  **WHEN** `/s/{code}` is requested
  **THEN** the response redirects to the original URL (status: see OQ3).
- **GIVEN** a code that does not exist
  **WHEN** `/s/{code}` is requested
  **THEN** a not-found page with HTTP 404 is shown, with a way back to the home page.
- **GIVEN** an existing code `aB3xK9q`
  **WHEN** `/s/ab3xk9q` is requested
  **THEN** it is treated as a different code (codes are case-sensitive), so the result is a 404 unless that code also exists.
- **GIVEN** a malformed code (wrong length, characters outside `[0-9A-Za-z]`)
  **WHEN** requested
  **THEN** a 404 is returned.

## R5 — Click tracking

Each successful redirect SHALL increase the link's click count by exactly 1 and record the time of that click as its last-clicked time. Click tracking is secondary to redirecting: a failure to record a click SHALL NOT block or delay the redirect.

- **GIVEN** a link with 0 clicks
  **WHEN** it is followed 3 times
  **THEN** its click count is 3 and its last-clicked time is the time of the third click.
- **GIVEN** a link
  **WHEN** N redirects for it happen concurrently
  **THEN** its click count increases by exactly N (no lost updates).
- **GIVEN** an unknown or malformed code
  **WHEN** requested
  **THEN** no link's click count changes.
- **GIVEN** a newly created link
  **WHEN** it has never been followed
  **THEN** its click count is 0 and it has no last-clicked time.
- **GIVEN** an existing link, and recording the click fails (e.g. the write is rejected or times out) while reading still works
  **WHEN** the short link is followed
  **THEN** the user is still redirected (302) to the original URL, the failure is logged on the server, and that click isn't counted.
- **GIVEN** the data store can't be read at all
  **WHEN** a short link is followed
  **THEN** a generic error page is shown (there's no known target to redirect to).

## R6 — Persistence

Links and their stats SHALL survive an application restart.

- **GIVEN** a created link with some clicks
  **WHEN** the application restarts (the database keeps running)
  **THEN** the short link still redirects and its click count is unchanged.
- **GIVEN** the Docker setup with its database volume
  **WHEN** the containers are stopped and started again (without removing volumes)
  **THEN** all links and stats are still present.

## R7 — Stats list

A page at `/urls` SHALL list all short links, newest first. Each entry shows the short link, original URL, click count, creation time, and last-clicked time.

- **GIVEN** several links
  **WHEN** `/urls` is opened
  **THEN** they are listed newest first, with all fields listed above.
- **GIVEN** a link that has never been clicked
  **WHEN** it is listed
  **THEN** its last-clicked time shows as "Never" (or equivalent), not a blank or an epoch date.
- **GIVEN** no links exist
  **WHEN** `/urls` is opened
  **THEN** an empty state is shown with a link to create one.
- **GIVEN** a link is followed
  **WHEN** `/urls` is reloaded
  **THEN** the updated click count is shown.
- **GIVEN** a very long original URL
  **WHEN** it is listed
  **THEN** it does not break the layout (it is truncated or wrapped), and its full value is still available to the user.
- **GIVEN** any visitor, with no login or session
  **WHEN** they open `/urls`
  **THEN** they see every stored link. The list is public by design (see OQ8).

## R8 — Shortening UX

The shortening form SHALL give clear feedback while a request is in progress and after it finishes.

- **GIVEN** the user submits the form
  **WHEN** the request is in progress
  **THEN** a loading state is shown and the submit button is disabled, so a double click doesn't create two links.
- **GIVEN** a successful result
  **WHEN** the user clicks the copy button
  **THEN** the short link is copied to the clipboard and a confirmation is shown.
- **GIVEN** the clipboard is unavailable (permission denied or an insecure context)
  **WHEN** the user clicks copy
  **THEN** a failure message is shown, and the short link stays visible so it can be copied manually.
- **GIVEN** the UI on a phone-width screen
  **WHEN** it is used
  **THEN** the form, result and stats list are usable without horizontal scrolling.
- **GIVEN** the shortening form
  **WHEN** it is displayed
  **THEN** a notice near the form says that shortened links are listed publicly and private URLs shouldn't be shortened.

## R9 — Rate limiting on link creation

The system SHALL allow each client IP at most **10 link-creation submissions per fixed 60-second window**. Both values SHALL be configurable (`RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_SECONDS`). Every submission counts toward the limit, including invalid ones. A client that is over the limit gets HTTP 429 with a `Retry-After` header.

- **GIVEN** a client that has made 9 submissions in the current window
  **WHEN** it submits a valid URL
  **THEN** the link is created normally.
- **GIVEN** a client that has made 10 submissions in the current window
  **WHEN** it submits another URL
  **THEN** no link is created, the response status is 429, a `Retry-After` header gives the seconds until the window ends, and the message says when to try again (e.g. "Too many links created. Try again in 42 seconds.").
- **GIVEN** a client that submits invalid URLs
  **WHEN** those submissions are rejected by validation
  **THEN** they still count toward the limit.
- **GIVEN** client A is over the limit
  **WHEN** client B (a different IP) submits
  **THEN** client B is unaffected.
- **GIVEN** a client that was limited
  **WHEN** its current window ends
  **THEN** it can make up to the limit of submissions again.
- **GIVEN** `RATE_LIMIT_MAX=3` and `RATE_LIMIT_WINDOW_SECONDS=10`
  **WHEN** a client makes a 4th submission within 10 seconds
  **THEN** it is rejected with 429.
- **GIVEN** trusted-proxy mode is off (the default)
  **WHEN** a client sends an `X-Forwarded-For` header with a different IP on each request
  **THEN** the header is ignored and the client is limited by its connection IP (spoofing the header can't get around the limit).
- **GIVEN** trusted-proxy mode is on (`TRUST_PROXY`)
  **WHEN** a request arrives through the proxy
  **THEN** the client IP is the rightmost `X-Forwarded-For` entry, which is the one the proxy appended; any entries the client supplied are ignored.
- **GIVEN** any client
  **WHEN** it follows short links
  **THEN** redirects are not rate limited.

Accepted trade-off: with fixed windows, a client can make up to 2× the limit in a short burst across a window boundary. The limit is per application instance; sharing it across instances (Redis) is listed under "With more time" in the proposal.

## R10 — Configuration

The application SHALL refuse to start when required configuration (public base URL, database connection) is missing, and the error SHALL name the missing setting.

- **GIVEN** `PUBLIC_URL` is not set
  **WHEN** the server starts
  **THEN** it fails at startup with an error naming `PUBLIC_URL`, rather than producing short links like `undefined/s/...`.
- **GIVEN** `PUBLIC_URL` has a trailing slash (`http://localhost:3000/`)
  **WHEN** a link is created
  **THEN** the short link has no double slash (`http://localhost:3000/s/{code}`).

## R11 — Docker

`docker compose up --build` SHALL start the application and its database. The schema SHALL be applied automatically, and the app SHALL be reachable on port 3000.

- **GIVEN** a clean checkout with no existing volumes
  **WHEN** `docker compose up --build` runs
  **THEN** the app becomes reachable at `http://localhost:3000`, and shortening, redirecting and `/urls` all work.
- **GIVEN** the database is not yet ready
  **WHEN** the containers start
  **THEN** the app waits for it instead of crashing on its first connection attempt.
- **GIVEN** an existing database volume
  **WHEN** the containers restart
  **THEN** migrations are applied without losing data (see R6).

## Non-behavioral deliverables (from proposal)

- **D1**: Automated tests cover the core use cases: R2 (collision retry, retry limit), R3 (validation rules) and R5 (click counting), without needing a running database.
- **D2**: `README.md` Docker and local setup instructions match reality. `CHALLENGE_SUBMISSION.md` is filled in.

---

## Open questions

1. **OQ1 — Maximum URL length.** 2048 characters is a common practical limit. Confirm the value.
  - 2048 characters is ok
2. ~~**OQ2 — Rate limit values.**~~ **Resolved → R9:** 10 submissions per 60-second fixed window per IP, configurable. Every submission counts. Over the limit → 429 + `Retry-After`. `X-Forwarded-For` is trusted only when `TRUST_PROXY` is on, and then only its rightmost entry.
3. **OQ3 — Redirect status.** 302 (temporary) or 301 (permanent)? Browsers cache 301 redirects and skip the server on repeat visits, so those clicks wouldn't be counted (R5). 302 is the natural fit, but the proposal doesn't say.
 - Redirect with code 302, we don't want browser cache for our stats.
4. **OQ4 — Scheme-less input.** Should `example.com` be rejected as invalid (current R3), or automatically prefixed with `https://`?
  - Reject with meaningful message: "your URL should start with http or https".
5. ~~**OQ5 — Scope of "self-links".**~~ **Resolved → R3:** only the exact `PUBLIC_URL` host (hostname and port, case-insensitive). Blocking loopback and private IPs and other shortener domains is deferred to the "domain blocklist" item under "With more time".
6. **OQ6 — Credentials in URLs.** Should URLs with embedded credentials (`https://user:pass@host`) be rejected? They're a known phishing trick.
  - Yes, reject them with meaningful message "Embedded credentials are not permited. They could be used for phishing purpose". 
7. **OQ7 — Bot and preview clicks.** Do crawler and link-preview fetches (Slack or WhatsApp previews, search bots) count as clicks, or only human visits?
  - Keep it simple, validations like this can be done later
8. ~~**OQ8 — Stats visibility.**~~ **Resolved → R7, R8:** `/urls` is public (the challenge requires a stats list and doesn't mention authentication), and the form warns users that links are listed publicly. Privacy and link ownership are deferred to "Users/auth" under "With more time".
  - Yes, it can be done later
9. ~~**OQ9 — Whitespace and normalization.**~~ **Resolved → R3:** trim the input, then validate, store and redirect using the WHATWG parser's rewritten form of the URL, so there's no gap between what we check and what the browser opens. No semantic normalization (stripping `www.`, tracking parameters, reordering the query, dropping fragments). Length is measured on the normalized form.
