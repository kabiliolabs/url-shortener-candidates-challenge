# Submission

## What I Did

### What I found

Before changing anything I ran the original and wrote down what was actually broken:

- If `PUBLIC_URL` is missing the app still starts and builds broken links like `undefined/s/ba`. There is no fail-fast on configuration.
- Codes were 2 characters from 3 letters: only 9 possible codes.
- When a code repeated, the new link silently overwrote the old one.
- There was no URL validation: `hola` got a short code.
- An unknown code returned a plain-text "Not Found".
- Links lived in an in-memory `Map`: nothing survived a restart.

### What I prioritised

Correctness of the core first, then the structure that keeps it correct, then the UI. In order:

1. **Persistence and Docker.** PostgreSQL through Prisma, with `docker compose up --build` as the only step. Everything else depends on real storage, so it went first.
2. **Layers.** Domain, application and infrastructure inside `libs/engine`, with the web app as a thin HTTP layer on top.
3. **Validation and error mapping.** Invalid input is a `400` with a message a person can act on; anything unexpected is a `500` that is logged and reveals nothing.
4. **Tests** for the parts where a bug would be silent: the retry on collision, the validation rules and the rate limiter.
5. **UI**, rebuilt with shadcn components, with loading, error and empty states.
6. **Abuse protection**: a rate limit on creation.

Each step is one commit, and most commit messages explain the reasoning.

### Decisions and why

- **Uniqueness is the database's job.** Short codes are unique through a `UNIQUE` constraint plus a retry (up to 5 attempts), never a lookup followed by an insert. Check-then-insert lets two concurrent requests claim the same code. The original lost links in a simpler way (a repeated code overwrote the previous URL), and I did not want to replace that with a subtler version of the same bug. The repository port has no `exists` method, so the wrong approach cannot be written by accident.
- **Clicks are counted atomically.** One `UPDATE ... SET clicks = clicks + 1 ... RETURNING` finds the URL and counts the click. Reading the row and writing `clicks + 1` back would lose clicks under concurrency. I checked this by hand: 50 parallel requests (`seq 1 50 | xargs -P 25 -I{} curl -s -o /dev/null <short URL>`) raised the counter by exactly 50.
- **302, not 301.** Browsers cache permanent redirects, so later clicks would never reach the server and would not be counted.
- **Codes are 7 random base62 characters from `node:crypto`.** About 3.5 trillion combinations, so collisions are rare and existing links cannot be found by guessing or by predicting the generator.
- **Validation lives in a value object.** `OriginalUrl` can only be created through a factory that validates, and the repository takes an `OriginalUrl` instead of a string, so an unvalidated URL cannot reach the database. The protocol allowlist (`http`, `https`) matters because the app redirects to whatever is stored: `javascript:` or `data:` URLs would turn the redirect into an attack. The app's own host is blocked so short URLs cannot be chained to hide the real destination.
- **Importing the engine has no side effects.** It reads no environment variables and creates no database client. The web app does both in a single composition root (`services.server.ts`) and injects them. That is what makes the use cases testable with an in-memory repository and no mocks of modules.
- **Configuration fails fast.** The app refuses to start without a valid `PUBLIC_URL` instead of producing `undefined/s/...` links.
- **Prisma errors are detected by `error.code`, not `instanceof`.** The generated client throws the CommonJS error classes, and an ESM import of the same class is a different copy, so `instanceof` is silently false.
- **Tests assert through the port.** They use the in-memory repository and check results with `list()`, the same method the app uses, instead of test-only helpers. The fakes (a code generator with a fixed sequence, an injected clock) make collisions and time deterministic.
- **The engine has no build step.** The web app bundles its TypeScript source directly, so compiling it to `dist/` was dead output and I removed it.
- **Dates without hydration mismatches.** The server cannot know the viewer's time zone, so the first render shows UTC (built by hand, so server and client produce the same text) and switches to the viewer's zone and locale after mount.
- **The 404 is a real page.** `/s/:code` has a default export on purpose: React Router answers a 404 thrown from a resource route as plain text and skips the error boundary.
- **The form works before JavaScript loads.** It uses a fetcher for the inline experience and falls back to a normal form submission. The input is marked invalid only for validation errors, not for server errors, where the value may be fine.
- **The list failing does not take the page down.** If it cannot be loaded, the form still works and the list shows a message.
- **Rate limiting is an HTTP concern.** Who the client is and when to refuse them is decided in the web layer, not in a use case, so there is no port for it: the limiter is a generic building block that the composition root creates and the action calls. The limit is 10 creations per minute, checked before validation so invalid input counts too.
- **`X-Forwarded-For` is trusted only on request.** With `TRUST_PROXY=true` the client is the last value of the header, the one a single trusted proxy appends; earlier values come from the client and can be forged. Without it, all clients share one limit. I chose a limit that is too strict over one that can be bypassed with a header.

### What I left out on purpose

Authentication, pagination, link expiry and custom aliases. None of them is needed for the three things the service has to do, and each would have taken time from getting those three right.

## What I Would Do With More Time

- **Integration tests against PostgreSQL.** The Prisma repository has no automated test. The retry on collision is unit-tested with the in-memory repository, so the branch that turns PostgreSQL's unique violation (`P2002`) into `ShortCodeAlreadyExists` has never actually executed: random codes do not collide in practice. Concurrent clicks were checked by hand once. An integration test would force a duplicate code and fire 50 concurrent clicks against PostgreSQL.
- **A `ShortCode` value object.** The code from the URL path goes to the database as an unchecked string. A value object would reject malformed codes (wrong length or alphabet) before any query.
- **Rate limiter storage.** Keys are never evicted, so memory grows with the number of distinct clients, and counters are per process. I would add eviction, or move to Redis with a TTL equal to the window, which also makes the limit shared between instances.
- **The global limit without a trusted proxy.** With `TRUST_PROXY=false` one client can use up the limit for everyone. It cannot be bypassed, but it is a denial of service on creation. A real deployment sits behind a proxy and sets the variable; without one I would need another way to tell clients apart.
- **Bots and link previews inflate clicks.** Every request to a short URL counts, including crawlers and the previews that chat apps fetch. I would filter known bots and probably count unique visitors separately.
- **The list is public.** Anyone can see every link and its statistics. With users, each person would see only their own.
- **Pagination.** The list shows the latest 100 and nothing else.
- **The own-host check compares the host as written.** If `PUBLIC_URL` uses `localhost`, then `127.0.0.1` is not blocked, and neither is any other name that points to the same server. Fixing it properly means comparing against a configured list of aliases.
- **Migrations as a separate step.** They run when the container starts, which is fine for one instance. With several replicas they should be a job that runs once before the deploy.
- **Observability.** Structured logs with a request id and a health endpoint that checks the database.
- **An end-to-end test of the form**, covering the loading state, the inline error and the copy button, which today I only checked by hand.

## AI Usage

I used Claude Code as a pair that writes most of the code while I decide what gets built, in what order and to which rules. The repository keeps the evidence: [`CLAUDE.md`](./CLAUDE.md) is the file I wrote for the agent before any refactor.

### How I worked

1. **Rules before code.** The first commit is `CLAUDE.md`: the domain language, the architecture rules (layers, no side effects on import, one composition root) and the correctness rules (UNIQUE plus retry, atomic clicks, 404 for unknown codes). I added rules as decisions came up, for example pinning Prisma to 6.x and detecting Prisma errors by `error.code`.
2. **One step at a time.** For each step I wrote a short brief with the goal, the design I wanted and what not to touch. The agent answered with a plan and its open decisions, and changed nothing until I approved.
3. **Verification I could read.** After each step the agent ran typecheck, the tests and `docker compose up --build`, exercised the app with `curl`, and reported what it had checked and what it had not. I reviewed the diff and checked the UI in the browser myself.
4. **I kept the irreversible parts.** The agent never committed or pushed. I ran the migration, wrote the commits and reviewed every sentence of this document, because it speaks in my name.

### Example prompts

Excerpts from the briefs I sent for each step:

> ShortenUrl retries up to 5 times when the code already exists.

> Importing the engine must have no side effects: [...] the engine neither reads process.env nor creates a PrismaClient.

> Do not touch routes or UI yet. Do not create the migration, I will run it.

> No port in application: deciding who the client is and when to limit is HTTP, so the composition root creates the limiter and the create action calls it.

> Mark the input invalid only for validation errors, not for server errors.

> Assert through the port's own methods (list), not test-only methods.

And a correction after reviewing its output:

> Make invalidUrl a boolean: true only when the input was rejected by OriginalUrl, false otherwise. An empty input gives "", which is falsy, so the form could not mark it as invalid.

### Where I corrected it

- Its first version of the domain language rule banned synonyms everywhere, including the UI. I limited it to code and tests: interface copy should use everyday words like "link".
- It returned the rejected input as `invalidUrl`, which breaks for an empty string. I changed it to a boolean.
- A comment claimed that blocking our own host prevents redirect loops. With random codes a loop is practically impossible; what it prevents is chains that hide the destination.
- Its first draft of this document said the original lost links through concurrency. It did not: a repeated code simply overwrote the previous URL. It also described a test of 50 parallel clicks as mine before I had run it myself, so I ran it.
- It wrote in the README that routes import only from the composition root. They also import the domain error classes.

### Where it caught things I had not asked about

- Vite could not resolve `@prisma/client` from the web app, because pnpm does not link a dependency of the engine into it.
- The latest Vitest needs Node 22 and the Docker image runs Node 20, so it proposed Vitest 4 instead of changing the image.
- `Retry-After` was missing from the 429 of a plain form submission: React Router drops action headers unless the route forwards them. It found this by checking the response instead of trusting the code.
- With a fetcher only, the form showed nothing when submitted before JavaScript loaded.

### What I take from it

The agent is fast and thorough on the mechanical work and on verification. The value I add is upstream and downstream: deciding the rules, keeping each step small enough to review, and not accepting a sentence I cannot defend. The mistakes I found were never in whether the code ran. They were in claims about what the code does or what had been tested.

## Feedback

The exercise was clear and a good fit for the time available: small enough to finish, with enough room to show how I prioritise.

I also liked how the process is run. The short delivery window keeps things moving instead of stretching the process out, and I appreciated how quickly you got back to me after the technical interview.
