# Submission

## What I Did

I treated the exercise as a refactor, not a rewrite: same stack, same monorepo, but the
code reorganised around a domain that does not know the framework exists.

### Architecture — hexagonal (ports & adapters)

`libs/engine` now holds the domain and the application layer with **zero runtime
dependencies**:

```
libs/engine/src
├── domain/        ShortenedUrl (aggregate) · DestinationUrl + ShortCode (value objects)
│                  ShortenedUrlRepository (port) · typed domain errors
├── application/   ShortenUrl · ResolveShortenedUrl · ListShortenedUrls (use cases)
└── test-support/  InMemoryShortenedUrlRepository (fake adapter for tests)
```

`applications/web` holds the adapters: routes (driving), `PrismaShortenedUrlRepository`
(driven), the rate limiter and the configuration. `app/container.server.ts` is the single
composition root. Prisma types never leave `app/infrastructure/prisma/`.

Why it matters here: the use cases are tested with an in-memory repository in
milliseconds, and swapping SQLite for Postgres is a `provider` change plus one adapter —
the domain does not move. That is the Dependency Inversion Principle doing actual work,
not an architecture diagram for its own sake.

### The short-code generator

The original produced 2 characters out of `"abc"` → **9 possible codes** (≈50% chance of
a collision after 4 URLs), and a collision **silently overwrote someone else's link**
because `shortenedUrls.set()` never checked for existence.

Now: 7 characters out of a 56-symbol unambiguous alphabet (no `0/O/1/l/I`) → **56⁷ ≈
1.7 × 10¹²** combinations, drawn from a CSPRNG (`node:crypto`) instead of `Math.random()`,
which is predictable and would let anyone enumerate links.

Collisions are handled by **the database, not by a prior read**: `code` has a unique
index, `save()` translates Prisma's `P2002` into a domain `ShortCodeCollisionError`, and
the use case retries with a fresh code. A "check, then write" would still be racy. It is
also idempotent: shortening the same URL twice returns the same short link.

### Persistence

Prisma + SQLite, with a `ShortenedUrl` model (`code @unique`, `destination`, `clicks`,
`createdAt`, `lastVisitedAt`). SQLite over Postgres was a **deliberate time trade-off**:
it satisfies "data survives a restart" with one named Docker volume and no second
container to orchestrate (no healthcheck, no wait-for-db, no connection juggling). The
port/adapter split means that decision is reversible in minutes.

Click counting is a single atomic `UPDATE ... SET clicks = clicks + 1`; a
read-modify-write would drop clicks whenever two visits overlap.

### Security / abuse prevention

This is where the original code was genuinely dangerous, not just untidy:

- **Stored XSS + open redirect.** Any string was stored and then rendered into an
  `<a href>` and passed to `redirect()`, so `javascript:alert(1)` or `data:text/html,…`
  worked. `DestinationUrl` now enforces an `http`/`https` **allowlist** in the domain, so
  no future entry point can bypass it, and the same validation runs again when a row is
  read back (defence in depth).
- **Rate limiting**: fixed window, 10 creations per minute per client, with a real `429`
  and `Retry-After`.
- Length cap (2048), host sanity check, non-root container, `Referrer-Policy: no-referrer`
  on the redirect so the destination site does not learn the originating link.

### Click statistics

`/s/:code` resolves and counts in one use case, so it is impossible to redirect without
recording the visit. The redirect is **302 with `Cache-Control: no-store`** — a 301 gets
cached by browsers and proxies, and every cached hit would be a click we never see.
`/urls` shows totals (links, clicks, average) plus a per-link table with clicks, creation
date, last visit and copy-to-clipboard.

### Frontend

- Rebuilt as a minimalist neutral design: hierarchy from contrast and spacing, not colour.
  Light and dark mode.
- Reusable components (`Button`, `Input`, `Card`, `Stat`, `Alert`, `CopyButton`) with a
  shadcn-style API (`variant`/`size`/`className` passthrough), written by hand instead of
  scaffolded by the CLI — at this size it kept the dependency count at zero.
- **Loading states**: `useNavigation()` disables the input and swaps the button for a
  spinner while the action is in flight.
- **Errors**: server-side validation messages with the right status code (`400`/`429`/`500`),
  rendered in a `role="alert"` region, with `aria-invalid`/`aria-describedby` wired up and
  the user's input preserved so they can fix it. A real **404 page** for unknown codes via
  a route-level `ErrorBoundary` (a snackbar is not possible there — a redirect is a full
  server navigation).
- Labels, focus rings, `prefers-reduced-motion`, and tables that scroll instead of the page.

### Testing

18 unit tests (Vitest) on the parts where a bug is expensive and the cost of a test is
low: scheme/format validation, code generation (deterministic via an injected randomness
source), collision retry, idempotency, click counting, and the "unknown == malformed"
behaviour. No database needed — that is the payoff of the port.

### Docker

- `openssl` added to the base image: Prisma's query engine needs it on Alpine, and
  `binaryTargets` includes `linux-musl-openssl-3.0.x`. Without this the container boots
  and then dies on the first query.
- Named volume `url-shortener-data`, `DATABASE_URL=file:/app/data/app.db`, and
  `prisma migrate deploy` on every boot, so a fresh container converges to the right
  schema and the data survives `down`/rebuild.
- `--ignore-scripts` in the dependency layer (no schema there yet) with an explicit
  `prisma generate` in the build layer; runs as the non-root `node` user; healthcheck in
  compose.

### Housekeeping

Removed a stray `package-lock.json` (a `npm install` run by mistake in a pnpm repo) and
regenerated `pnpm-lock.yaml`, which the Docker build needs with `--frozen-lockfile`.

## What I Would Do With More Time

Ordered by what I would actually pick up next:

1. **SSRF guard.** `http`/`https` is allowed, but internal targets are not blocked yet:
   `localhost`, RFC1918 ranges, and cloud metadata (`169.254.169.254`). Needs DNS
   resolution at creation time plus a re-check on redirect.
2. **Distributed rate limiting.** The current limiter is in-process: correct shape, wrong
   scale. With more than one instance it must move to Redis or to the edge/CDN, and be
   keyed on something better than `x-forwarded-for` (which is spoofable unless a trusted
   proxy sets it).
3. **Integration + E2E tests.** The Prisma adapter is only covered through its interface
   today; I would test it against a real SQLite file (including the `P2002` path) and add
   a Playwright run for shorten → redirect → counter.
4. **Postgres**, now that the adapter boundary makes it cheap, plus connection pooling.
5. **Richer statistics**: referrer, user agent, country and a time series, which means a
   separate `Click` events table instead of a counter column.
6. **Product features**: custom aliases, expiry dates, QR codes, per-link deletion,
   pagination on `/urls` (currently capped at 50).
7. **Tooling**: ESLint/Biome + Prettier, a GitHub Actions pipeline (typecheck, test,
   docker build) and a `/health` endpoint for the healthcheck instead of `/`.
8. **Observability**: structured logging and error reporting; `console.error` is a
   placeholder.

## AI Usage

I used **Claude Code (Opus)** as a pair programmer for the whole session, and I drove it
with an analysis-first workflow rather than asking for code straight away.

**1. Read-only analysis before touching anything.** My first prompt was deliberately
restrictive:

> *"I'm doing a technical test, this project is the exercise. Analyse it in depth, don't
> modify anything, just analyse it and explain it to me."*

That produced a defect inventory (the 9-code generator, the stored XSS via
`javascript:`, the module-level `Map`, `process.env.PUBLIC_URL` with no validation) and a
mapping of each challenge requirement against the current state.

**2. I wrote my own priority list, then had it challenged.** I listed what I wanted to do
and asked for a comparison against the model's plan, including an explicit time budget.
Four of my assumptions changed as a result:

- I had "fix Docker" as step 1. It was pointed out that Docker already worked and that
  adding Prisma would break it anyway — so it moved to the end, with a smoke test early.
- I was going to add a Postgres container. SQLite + volume was the better call for the
  time available.
- I asked whether the test suite was worth the time at all; the answer (domain-only unit
  tests, never wired into the Docker build) is what shipped.
- The model flagged two gaps in my list: abuse prevention, and this document.

**3. Implementation under review.** I had the model implement in blocks (domain → adapter
→ routes → UI → tests → Docker) so I could review each one, and it caught things I would
have debugged the hard way — notably that Prisma on Alpine needs `openssl`, and that
importing `node:path` from a non-`.server` file risks leaking into the client bundle
(hence `config.server.ts`).

Example prompts I used:

> *"Priorities: 1. get Docker working. 2. organise the code following hexagonal.
> 3. improve the shortener: better algorithm, persist the data, avoid collisions …
> Is it worth setting up the whole test system? Will it eat a lot of time? Does it
> complicate the Docker deployment?"*

> *"Go for it, but also fill in CHALLENGE_SUBMISSION.md and write explanatory commits
> when you finish the implementation."*

What I kept for myself: the priority calls, the SQLite-vs-Postgres trade-off, the scope
cuts, and reviewing every diff. What I delegated: boilerplate, the exhaustive defect
sweep, and remembering the infrastructure gotchas.

## Feedback

The brief is clear and the "deliberately flawed intern code" framing works really well —
the bugs are planted at different depths (the ugly UI is obvious, the 9-code generator
takes a minute, the `javascript:` scheme reaching `redirect()` only shows up if you think
about security), which makes it a good signal of how deep a candidate actually looks.

Two notes:

- **~2 hours is tight for the stated requirements.** Database + repository pattern +
  SOLID + tests + a redesigned UI + security + Docker is comfortably a half-day if done
  properly. The instruction to prioritise mitigates this, but it is worth being explicit
  that nobody is expected to tick every box, otherwise candidates spread themselves thin
  and do everything shallowly.
- **`pnpm` is assumed but not checked.** `corepack` is available on a default Node install
  but `pnpm` is not on the PATH, which is an easy way to lose five minutes (and to end up
  with an accidental `package-lock.json`). A line in the README — `corepack enable` — would
  remove that friction.

Nice touch: the fact that `CHALLENGE_SUBMISSION.md` asks about AI usage. It is a more
honest read on how someone actually works than pretending the tools do not exist.
