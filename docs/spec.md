# Spec: URL shortener (Kabilio challenge)

Source: `docs/decisions.md` (the reasoning behind each decision lives there; this spec says what to build).

## Goal
1. Shorten links.
2. Count clicks atomically.
3. Simple, clean UI, no design system.

Closed scope: no users, no channels, no rate limit, no bot filtering.

## Behavior

### Create (`POST` from the main screen)
- Input: `url` (string).
- Canonicalize: `trim` → `new URL(input).href`.
- Reject with a clear message if:
  - it doesn't parse or has no scheme;
  - the scheme is neither `http:` nor `https:`;
  - it includes a username or password;
  - it exceeds the max length (`MAX_URL_LENGTH` = 2048).
- If the canonical URL already exists → return its existing code (don't create another).
- Otherwise → generate a code and save.
- Response on screen: the full short link (`PUBLIC_URL` + `/s/` + code).

### Redirect (`GET /s/:code`)
- Code exists → increment `clicks` atomically and respond `302` with `Location` = original URL.
- Code doesn't exist → `404`.
- The counter counts every GET to `/s/:code`, not just real clicks: bots and unfurlers (e.g. Slack's link preview) included. Filtering them is out of scope.

### List (main screen)
- Latest N links (`LIST_LIMIT` = 20), newest first: short link, original URL, clicks.
- The on-screen link uses `<a>` or `<Link>` without `prefetch`.

## Short code rules
- Alphabet `a-z0-9`, length 7, generated with `crypto` (never `Math.random`).

## Persistence
- Database: Postgres (confirmed) in `docker-compose`.
- Prisma model `ShortLink`: `id`, `url` (UNIQUE), `code` (UNIQUE), `clicks` (int, default 0), `createdAt`.
- Counter: `clicks: { increment: 1 }`, never read-add-write.
- P2002 error, by `meta.target`:
  - `url` → read and return the existing one;
  - `code` → new code and retry, max 5 attempts, then error;
  - other → propagate.

## Architecture
- Dependency rule: `libs/engine` imports nothing external (no Prisma, no `applications`, no third-party libraries). `applications/web` is the only package that imports engine and may use any third-party library it needs. The prohibition is the reverse arrow.
- Prisma is only imported in the adapter (`PrismaShortLinkRepository`) and in the `prisma` folder. Routes and the rest of `applications/web` don't import Prisma; they only know the `ShortLinkRepository` port.
- `libs/engine` (no Prisma or React Router dependencies):
  - domain as pure functions: `canonicalizeUrl`, `generateCode`, domain errors;
  - port `ShortLinkRepository`;
  - use cases `shortenUrl`, `resolveCode`, `listShortLinks`;
  - adapter `InMemoryShortLinkRepository` (fake).
- `applications/web`:
  - `PrismaShortLinkRepository` and the composition root in `.server` modules;
  - routes `_index.tsx` and `s.$code.tsx` as HTTP adapters: they parse, call the use case, respond.
- Classes only for adapters.

## Docker
- `docker-compose`: services `db` (Postgres, healthcheck, named volume) and `web` (`depends_on: condition: service_healthy`, `DATABASE_URL`, `PUBLIC_URL`).
- Image: OpenSSL installed, copies `prisma/`, `prisma generate` before `pnpm build`.
- Start: `prisma migrate deploy`, then serve.
- Initial migration committed.
- `DATABASE_URL` inside compose uses the service host (`db`); from the host machine, `localhost`.

## Tests (vitest)
- Cover the domain, use cases and the port contract with InMemory, without fixing the exact content of each test.
- Don't modify existing tests; after every change, run the suite and keep it green.

## Work order (2 h version; every step ends with the app running)
1. Vertical slice: Prisma + Postgres + create + redirect + count, running with `docker compose up`.
2. Full validation and canonicalization + P2002 recovery.
3. Listing on screen (minimal, clean styling, no design work).
4. Domain, use-case and port-contract tests with InMemory.
5. README (how to run with Docker) and `CHALLENGE_SUBMISSION.md`.

## With more time (outside this delivery; named in the submission)
- Port contract suite against Postgres: in `applications/web`, opt-in with `DATABASE_URL`.
- Optimize the frontend: reuse components, split the HTML out of very large files and tidy the code so the repo stays clean.
- Creation rate limit, bot filtering.

## Done
- `docker compose up` from scratch brings everything up and the app works with no manual steps.
- Creating the same URL twice returns the same code.
- Every visit to `/s/:code` adds 1 and redirects with 302.
- Tests green.
- Submission with an AI section that stands on its own and points to `docs/decisions.md`.
- Submission states that the counter counts GETs, bots and unfurlers included.
- Submission states that the design was closed in a previous session.
