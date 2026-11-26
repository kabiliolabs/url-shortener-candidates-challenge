# Decisions log and AI work

## 0. Working approach

I spent the first part (~1 h) understanding before building:
- I read the code on my own, without AI, to form my own judgment.
- Then I asked Cursor for an overview to compare.
- I did several rounds of sparring with AI to close the product and data decisions: what the product solves, which assumptions I make, what the options are and how it would evolve (channels, users).
- I crossed two AIs: I built the design with one and passed it to Cursor to push back on it. I accepted what convinced me, argued what didn't, and closed each point myself (see section 6).

Why: for me this is the most critical part. Putting the brief in context, anticipating likely changes and having the flows clear reduces rework; with that closed, implementation with AI is fast and bounded.

**Role of this file:** it's the detailed record of the session (`docs/decisions.md`). The AI section of `CHALLENGE_SUBMISSION.md` stands on its own (tool, what I used it for and a couple of prompts) and points here for detail; it doesn't replace it.

## 1. Discovery: understanding the product and the current code

**Goal:** align on what the product solves and what the code does today before designing.

**How I used AI:** as a sparring partner, without generating code.
- "Explain what this app does today and how the data flows."
- "Which product decisions do I need to make before designing?"

**What the code does today:**
- It only validates that the URL isn't empty.
- It generates a random code and stores it in memory (`Map` code → URL); it's lost on restart.
- `/s/:code` redirects or returns 404.
- No dedupe: the same URL generates a new code every time.
- No click counter or listing.

**Assumptions:**
- Public tool, no users or login (the brief doesn't mention them).
- The counter doesn't depend on how many short links were attempted: it measures clicks to the original link, so with dedupe every creation of the same URL shares the same counter.

## 2. Decision: dedupe (one URL = one code = one counter)

**Decision:** if the canonical URL already exists, I return its existing code.

**Why:**
- Loosely defined requirements → I pick the simplest, most conservative option, open to extension.
- Clear data model: the URL is a unique entity; it avoids regrouping duplicates to see stats.
- It's a data-model decision, not abuse control: it doesn't stop anyone sending different URLs.
- It's not for performance: with an index, volume isn't a problem.

**Accepted trade-offs:**
- A URL's stats are shared among everyone who shortens it (acceptable without users; recorded as an assumption).
- It requires a canonical key.

**Canonical key:**
- Trim the input, then `new URL(input).href`. That stores a single `url` column (UNIQUE) and it's the same one used for the redirect.
- `href` already lowercases scheme and host, drops the default port and adds `/` only when the path is empty.
- I do NOT touch path or query params: they can be case-sensitive and `?ref=ig` vs `?ref=fb` are different on purpose.
- I do NOT convert `http` to `https`: they can be different resources, and forcing `https` would break links to sites that don't have it.

**Concurrency:** `UNIQUE` on `url` in the database. If two requests create at once, the one that collides returns the existing record; the user sees no error. Recovery depends on which constraint collided (`meta.target` of Prisma's P2002 error):
- `url` collides → I read and return the existing link;
- `code` collides → I generate another code and retry, with a cap on attempts;
- any other error → it propagates.

**Considered and discarded:**
- Requesting the URL to compare responses: slow, unreliable (down or dynamic pages), SSRF risk, and two different pages can respond the same.
- Not deduplicating: valid (per-channel stats, privacy, simpler), but it mixes the concept of a URL with that of a "share".

## 3. Scalability and product considerations: channels and users

Today there's a single table (`url` UNIQUE, `code` UNIQUE, `clicks`). If several short links per URL (one per channel) or users are needed later:
- Split `Url` (canonical URL, UNIQUE) from its short links (1→N), with a `source` column; users come in as an FK `userId`.
- The database still guarantees uniqueness with a composite constraint (`@@unique([urlId, source])`, or `[urlId, userId, source]` with users), with `source` default `""` so two NULLs don't duplicate the default link.
- The short code and the `/s/:code` redirect don't change.
- An aggregate `Url` → short links would only make sense then, for rules the database can't express. Today uniqueness lives in the `ShortLinkRepository` port contract and the guarantee in the adapter (`UNIQUE`, atomic `increment`); the contract tests cover observable behavior, not real concurrency, which the database guarantees.

## 4. Implementation decisions (core)

### Architecture (light hexagonal)
- Domain as pure functions (validate, canonicalize, generate code).
- Port `ShortLinkRepository` with two adapters: Prisma and InMemory (a fake, not a mock, to test the logic without a database).
- Use cases `shortenUrl`, `resolveCode`, `listShortLinks`; routes are HTTP adapters; a composition root wires everything.
- Classes only for adapters.
- Prisma lives in a `.server` module so React Router doesn't put it in the client bundle.

### Temporary redirect (302), not permanent (301)
- 301 = "moved for good": the browser caches it and later visits go straight to the destination without hitting the server, so the click counter never finds out.
- 302 = "it's here for now": the browser asks again every time, so every visit goes through the server and gets counted.
- Response: status 302 + `Location` header with the original URL; the browser follows that header.
- Trade-off: 302 adds one request per visit; acceptable because the counter is part of the product.
- React Router's `redirect()` uses 302 by default; make it explicit.
- The counter counts GETs to `/s/:code`, bots and unfurlers (e.g. Slack's link preview) included. This is stated in the submission; filtering them is out of scope.
- The on-screen link uses `<a>` or `<Link>` without `prefetch`, so the UI doesn't generate clicks.

### Atomic click counter
- Increment in the database (`clicks: { increment: 1 }` in Prisma), never read → add → write.
- Reason: with two simultaneous clicks, read-add-write loses one (race condition). Same concurrency criterion as the dedupe's `UNIQUE`: let the database guarantee consistency.

### Collision-free codes
- Lowercase alphabet `a-z0-9`, length 7, generated with `crypto` (not `Math.random`). That's ~78 billion combinations.
- Why lowercase: at this length the 62 upper- and lowercase symbols change nothing in practice, and a mixed-case code breaks when someone retypes it by hand.
- No special alphabet to remove `0`, `1` or `l`.
- `code` with `UNIQUE` in the database + capped retry on collision (see section 2): collisions are rare, but the guarantee comes from the constraint, not from probability.

### Docker and migrations
- The database comes up with `docker-compose` and the app waits for it to be healthy (healthcheck + `depends_on: condition: service_healthy`).
- Image: copy `prisma/`, run `prisma generate` before the build, install OpenSSL (Alpine needs it for Prisma).
- On start: `prisma migrate deploy` before serving. The initial migration is committed.
- Data in a named volume so it survives a restart.
- `DATABASE_URL` inside compose uses the service host (`db`); from the host machine, `localhost`.
- Reason: without this, `docker-compose up` brings up an empty database or an app that can't connect, and the delivery fails at the first thing they'll try.
- The README explains how to bring it up with Docker.

### Validation and abuse
- Only `http`/`https` schemes (blocks `javascript:`, plain text, etc.).
- Scheme-less URLs: rejected. No env var to loosen it. Autocompleting the scheme belongs to the frontend and is deferred; the backend only defines the contract.
- URLs with username or password are rejected (`https://user:pass@host`).
- Max URL length (2048, set in the spec).
- The listing shows the latest N links, not the whole table.
- Creation rate limit goes under "with more time": in 2 h it doesn't add value.

### Work order and tests
- First vertical slice (create → redirect → count) already running in Docker; then complete it.
- Logic tests with the domain and the InMemory fake.
- The contract suite against Prisma lives in `applications/web`, runs only if `DATABASE_URL` is set (opt-in) and is deferred to "With more time".
- New dependencies: `prisma`, `@prisma/client`, `vitest`.

## 5. Corrections to the AI
- Cursor described the product as "a code that belongs to him, not someone else": that implies owners/users and contradicts the dedupe. I flagged it; it confirmed it was its own interpretation, not the brief's.
- Cursor didn't mention: redirect type (301 breaks the counter), atomic increment, code uniqueness guarantee or migrations in Docker. Added above.

## 6. Cross-checking between AIs
**Accepted from Cursor:** canonical key with `new URL().href` in a single column; different recovery depending on which `UNIQUE` collided; Prisma in `.server`; the Docker fixes; dropping the env var for scheme-less URLs; opt-in contract suite; first vertical slice in Docker; reject username/password, max length, capped listing and README; not selling the dedupe as abuse control nor the contract as a concurrency guarantee.

**Closed differently:**
- Cursor proposed deleting `docs/decisions.md`. It stays: it's the session record, and the submission is a summary that points to it.
- Cursor said the on-screen link could inflate the counter via prefetch. An `<a>` doesn't prefetch, and React Router's `<Link>` doesn't either unless enabled. What is real is bots and unfurlers, and that's stated in the submission.
- Alphabet: lowercase `a-z0-9`, length 7, with `crypto`, no special alphabet.
