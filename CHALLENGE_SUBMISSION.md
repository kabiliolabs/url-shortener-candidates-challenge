# Submission

## What I Did

<!-- Briefly describe what you implemented or improved. What did you prioritize and why? -->

### Decisions and trade-offs

Full reasoning is in [`specs/2-hour-challenge/`](./specs/2-hour-challenge/) (proposal → spec → design).

**Architecture**
- **Simplified hexagonal.** `libs/engine` is the core. It holds every business rule (code generation, URL validation, collision retry, click recording) and has no I/O. It defines a `ShortUrlRepository` port. `applications/web` holds the route adapters, the Prisma adapter that implements the port, and the wiring (`app/.server/container.ts`). Routes only parse input, call a use case and map the result to HTTP.
- **The Prisma adapter lives in the web app, not in its own package.** pnpm's isolated dependencies plus Vite's SSR bundling make a source-only workspace package with runtime dependencies awkward. It gets its own package once a second deployable needs it.
- **Time-boxed to about 1 hour of implementation, in priority order:** persistence and architecture, then validation, then click stats, then Docker. Rate limiting and UI polish were designed and specified but cut (see "What I Would Do With More Time").

**Persistence (Postgres + Prisma 7)**
- **`shortCode` is the primary key.** Every redirect is a primary-key lookup, and the key's uniqueness backs the collision retry. No extra index is needed.
- **One atomic `UPDATE … RETURNING` per redirect.** It increments `clicks`, sets `lastClickedAt` and returns the target URL in a single round trip, with no lost clicks under concurrency.
- **`timestamptz` columns, snake_case table and column names, an index on `createdAt`** for the newest-first stats list.
- **Deliberately not stored:** a unique `originalUrl` (it would merge different users' stats) and the creator's IP (privacy).

**Short codes**
- **7 characters of base62 from `crypto.randomInt`** (about 3.5 trillion combinations). Codes are unpredictable, can't be enumerated, and have no modulo bias.
- **Uniqueness comes from the database constraint plus up to 5 retries,** not from checking whether a code exists before inserting it (which has a race condition).

**Validation and security**
- **Parse once, then use the parsed URL everywhere.** Input is trimmed and parsed with the standard WHATWG URL parser. The parser's rewritten form is what gets validated, stored and redirected to, so there's no gap between what we check and what the browser opens (e.g. `https:\\evil.com` or tabs hidden in `javascript:`).
- **Rules:** http/https only, the scheme is required, no embedded credentials (a phishing trick), no links to this service's own host, and at most 2048 characters (measured on the normalized form).
- **302 redirects, not 301.** Browsers cache 301 redirects, and those repeat visits would never be counted.
- **Configuration fails fast.** A missing `PUBLIC_URL` or `DATABASE_URL` stops startup with an error naming the variable.

**Frontend**
- **Functional over polished.** The pages cover the essentials: inline validation errors, a disabled button while submitting, a stats table and not-found and error pages, all styled with plain Tailwind. The reusable component set and the redesign were cut from the time box.

**Product**
- **Public stats list.** `/urls` shows every link to every visitor. The challenge asks for a list with statistics and doesn't mention authentication, and any real privacy (showing each user only their own links) needs ownership, meaning accounts or at least an anonymous owner ID stored with each link, which is outside the 2h budget. The downside: anyone who shortens a private URL (a document share link, a URL with a token in it) exposes it to everyone. To mitigate that, the form shows a notice that links are listed publicly. Accounts and link ownership are on the "more time" list.

## What I Would Do With More Time

<!-- What would you tackle next if you had more time? -->

**Next up: designed and specified, cut from the 1-hour time box** (details in [`specs/2-hour-challenge/`](./specs/2-hour-challenge/), requirements R8 and R9)
1. **Per-IP rate limiting on link creation.** 10 per IP per 60-second fixed window, configurable, with 429 + `Retry-After`. Invalid submissions count too. This needs a small custom Express server in place of `react-router-serve`, because `react-router-serve` doesn't pass the client IP to route code. `X-Forwarded-For` would be trusted only behind a known proxy (`TRUST_PROXY`), so clients can't dodge the limit by faking the header. The limiter would be a concrete class, with an interface extracted only when a second (Redis) implementation arrives.
2. **UI polish.** Small reusable Tailwind components (button, input, card, field error), a copy-to-clipboard button that shows a message if copying fails, a card layout for `/urls` on mobile, and a proper visual redesign. Migrating those components to shadcn/Radix would come after.
3. **More tests:** config parsing, plus integration tests for the Prisma repository against a real Postgres (see below).

**Performance and scale**
- **Redis cache for redirects,** so the most frequent request skips Postgres. Click counts would be buffered and flushed in batches, which also removes contention on the row of a very popular link.
- **Rate limiting shared across instances (Redis),** once the app runs as more than one instance.
- **Pagination and search** on the stats list.

**Security and abuse**
- **Domain blocklist:** refuse to shorten URLs pointing at hosts we don't want users hiding behind our links (malicious sites, other URL shorteners that could chain redirects, loopback and private addresses), including their subdomains.
- **Google Safe Browsing** check on submitted URLs.
- **Rate limiting by IPv6 `/64` prefix,** since one user typically controls a whole `/64`.

**Features**
- **User accounts and link ownership:** private stats, deleting or disabling links, custom aliases, expiring links.
- **Per-click analytics** (time, referrer, country, device) with charts over time, and filtering of bot and link-preview traffic.
- **QR codes** and link previews.

**Quality and operations**
- **Integration tests against a real Postgres** (Testcontainers) and **end-to-end tests** (Playwright).
- **CI pipeline** (typecheck, lint, test, Docker build), plus ESLint and Prettier config.
- **Production hardening:** a slimmer image (no dev dependencies, non-root user), healthchecks, structured logging and metrics.

## AI Usage

I used **Claude Code** (Claude Opus 5.5) as a pair programmer, prompted to act as a senior software engineer. I made the decisions: I set the direction, questioned the suggestions and approved each step before any code was written.

**How I used it so far**

- **Audit before coding.** In plan mode (read-only), the agent reviewed the repo and listed what the app currently does and its defects, ranked by severity. Top findings: code collisions that silently overwrite links, an open redirect caused by missing URL validation, in-memory state, and broken `PUBLIC_URL` handling.
- **Scoping and planning.** It turned `CHALLENGE_DESCRIPTION.md` into a prioritized ~2h plan plus a "with more time" backlog. I added items to the backlog, such as a Redis redirect cache and a domain blocklist.
- **Design discussions.** I asked it to justify choices before accepting them: the short-code generator, the data model and indexing.
- **Keeping it on a leash.** When the agent started implementing while I only wanted a plan, I stopped it and had it revert its changes. Planning and implementation stay separate steps that I approve.

**Example prompts**

> Act as a senior software engineer, this repo is a challenge exercise. First thing to do is check the code and describe current functionalities and mistakes.

> Based on CHALLENGE_DESCRIPTION.md let's plan the work to do, scope what can be done in ~2 hours, and create a list with the pending work if we had more time. First we need to add persistence, for the exercise let's use Postgres (more configuration needed, but more production ready) + Prisma. [...] refactor/move files to follow a simple architecture with separation of concerns (a simplified hexagonal) and following a repository pattern.

> Explain crypto-base code generator

Result: a 7-character base62 code from `node:crypto` `randomInt`. It is unpredictable and has no modulo bias. Uniqueness is guaranteed by the database's primary-key constraint, with retries when a code collides, rather than by checking whether a code exists before inserting it, which has a race condition.

> Let's define the table containing the data: it should have shortCode (primary key), originalUrl, clicks (counter for stats), createdAt. Any other suggestion?

Result: added `lastClickedAt` and an index on `createdAt`, used `timestamptz` and snake_case table/column names, and explicitly left out a unique `originalUrl` (it would merge different users' stats) and the creator's IP (a privacy concern).

## Feedback

<!-- Any feedback on the challenge? Was it clear? Too easy/hard? Suggestions? -->
