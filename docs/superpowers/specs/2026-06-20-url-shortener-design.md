# URL Shortener — Design Spec

**Date:** 2026-06-20
**Context:** Full-stack challenge — refactor a deliberately flawed URL shortener.

## Goal

Refactor the existing monorepo so the service can:

- Shorten URLs and generate **unique** short codes
- Redirect short codes to original URLs
- Track **click statistics** and list URLs with their stats

…while satisfying the challenge's requirement categories: clean modern UI with reusable
components, robust error handling + loading states, real database persistence that survives
restarts, repository pattern, anti-abuse security measures, SOLID code, input validation, and
tests on the important parts. Solution must run via `docker-compose up`.

## Decisions (locked during brainstorming)

| Area | Decision |
| --- | --- |
| Persistence | **Postgres** as a separate `docker-compose` service, via **Prisma** |
| UI | **shadcn/ui** (Radix primitives + Tailwind) |
| Layering | Keep it simple: short-link creation logic in `libs/engine`; web app holds Prisma adapter + UI |
| Short code | **Random base62 + retry on collision** (DB `UNIQUE` constraint) |
| Click stats | **Separate `Click` table** (time-series: timestamp, referer, user-agent) |
| Security | Strict URL validation, anti-SSRF (no private hosts), rate limiting on create, security headers |
| Testing | **Vitest** unit tests on the `libs/engine` domain |

## Architecture & layering

Dependency direction is one-way: `applications/web → libs/engine`. The domain knows nothing
about Prisma or React Router. The web layer provides the repository implementation and injects
it into the domain service (Dependency Inversion). Configuration (code length, base URL) is
passed in from the web layer — the domain never reads `process.env` directly (fixes the current
`base-url.ts` bug where env is read at module import time).

```
libs/engine/                      # Domain + application core (pure TS, no infra deps)
  src/
    domain/
      short-code.ts               # crypto-secure random base62 code generator
      url-validation.ts           # URL validation + normalization (Zod) + anti-SSRF host rules
      errors.ts                   # InvalidUrlError, CodeCollisionError, RetryExhaustedError
    ports/
      url-repository.ts           # UrlRepository interface (the "port")
    services/
      url-shortener.ts            # shorten(): validate → generate code → persist with retry
    index.ts                      # barrel exports

applications/web/
  prisma/
    schema.prisma                 # ShortenedUrl, Click models
  app/
    .server/
      db.ts                       # Prisma client singleton
      url-repository.prisma.ts    # PrismaUrlRepository implements UrlRepository
      rate-limit.ts               # in-memory token bucket keyed by IP
      container.ts                # composition root (wires repo + service + config)
      security-headers.ts         # shared security headers
    components/
      ui/                         # shadcn/ui components (button, input, card, table, ...)
      url-form.tsx                # creation form with inline error feedback + loading state
      url-list.tsx                # table of URLs with click stats
      click-stats.tsx             # (optional) per-link time-series detail
    lib/utils.ts                  # cn() helper for shadcn
    routes/
      _index.tsx                  # loader: list URLs+stats · action: create
      s.$code.tsx                 # loader: record click → redirect (or 404)
      links.$code.tsx             # (optional) per-link stats detail
    entry.server.tsx              # apply global security headers
    root.tsx                      # restyled layout + ErrorBoundary
```

## Domain — short-link creation

- **`generateShortCode(alphabet, length)`** — random base62 using `crypto.getRandomValues`
  (no `Math.random`, no modulo bias via rejection sampling). Default length 7 → ~3.5 trillion
  combinations. Pure and deterministic given an injected RNG (testable).
- **`UrlShortener.shorten(rawUrl)`**:
  1. Validate + normalize the URL (throws `InvalidUrlError` with a human-readable reason).
  2. Loop: `generateShortCode()` → `repo.create({ code, originalUrl })`. If the port throws
     `CodeCollisionError` (DB `UNIQUE` violation), retry up to `maxRetries` times; if exhausted,
     throw `RetryExhaustedError`.
  3. Return the created entity.
- No check-then-insert (which would race). Uniqueness is enforced by the DB constraint; the
  repository translates the unique-violation into the domain's `CodeCollisionError`.

### Repository port (interface)

```ts
interface UrlRepository {
  // throws CodeCollisionError when `code` already exists
  create(data: { code: string; originalUrl: string }): Promise<ShortenedUrl>;
  findByCode(code: string): Promise<ShortenedUrl | null>;
  list(): Promise<ShortenedUrlWithStats[]>;          // includes click count + last click
  recordClick(urlId: string, meta: ClickMeta): Promise<void>;
}
```

## Data model (Prisma + Postgres)

```prisma
model ShortenedUrl {
  id          String   @id @default(cuid())
  code        String   @unique
  originalUrl String
  createdAt   DateTime @default(now())
  clicks      Click[]
}

model Click {
  id        String       @id @default(cuid())
  urlId     String
  url       ShortenedUrl @relation(fields: [urlId], references: [id], onDelete: Cascade)
  createdAt DateTime     @default(now())
  referer   String?
  userAgent String?

  @@index([urlId])
}
```

- **List with stats**: query `ShortenedUrl` with `_count: { select: { clicks: true } }` plus the
  most recent click timestamp.
- **Detail**: time-series read from the `Click` table.

## Data flow & error handling

- **`_index` action (create)**: rate-limit by IP → validate via engine → `shorten()` → return
  the shortened URL **or** field-level errors. Loading state surfaced via `useNavigation().state`.
- **`s.$code` loader (redirect)**: `findByCode(code)` → throw 404 `Response` if absent →
  `recordClick` (referer + user-agent from request headers, wrapped in try/catch so a stats
  failure never blocks the redirect) → `redirect(originalUrl)`.
- Typed domain errors are mapped to friendly user messages in the web layer. The `ErrorBoundary`
  is restyled for 404 and unexpected errors.

## Security / anti-abuse

- **Strict URL validation (Zod)**: trim, max length 2048, must parse as a URL, protocol ∈
  {`http`, `https`}; reject dangerous schemes (`javascript:`, `data:`, `file:`).
- **Anti-SSRF**: reject `localhost`, `*.localhost`, and literal private/reserved IPs
  (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `::1`,
  `fc00::/7`). Limitation: we do not resolve DNS, so a public hostname that resolves to a private
  IP is not blocked — documented as a known trade-off for the time box.
- **Rate limiting**: in-memory token bucket keyed by client IP on the create action. Per-instance
  (not shared across replicas) — acceptable and documented for the challenge.
- **Security headers** (global, set in `entry.server`): `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`, plus a basic `Content-Security-Policy`.

## Testing (Vitest)

Unit tests on `libs/engine`:

- **Short code generation**: correct length/alphabet; uniqueness/distribution across many samples;
  uses injected RNG.
- **`UrlShortener.shorten`** with a `FakeUrlRepository`: happy path; retry on `CodeCollisionError`;
  exhaustion → `RetryExhaustedError`.
- **URL validation**: valid vs invalid schemes, over-length input, SSRF/private hosts rejected.

Add Vitest to the `engine` package and wire a `test` task in Turbo.

## Docker

- **`docker-compose`**: add a `db` service (Postgres + named volume + healthcheck). `web` gets
  `depends_on: { db: { condition: service_healthy } }`. On container start, run
  `prisma migrate deploy` then `start`. Env: `DATABASE_URL`, `PUBLIC_URL`.
- **Dockerfile**: run `prisma generate` during build; run migrations at runtime via an entrypoint.
- **`.env.example`**: add `DATABASE_URL`.
- Verify `docker-compose up --build` serves the app on `http://localhost:3000` before submission.

## Out of scope (YAGNI)

- User accounts / auth, custom vanity codes, link expiration, QR codes.
- Distributed/shared rate limiting (Redis), analytics dashboards beyond basic per-link stats.
- E2E / integration tests (domain unit tests only, per decision).

## Deliverables

- Working refactored app (UI + redirect + stats) on Docker.
- `README.md` Docker section verified and accurate.
- `CHALLENGE_SUBMISSION.md` filled in (what was done, what's next, AI usage with example prompts,
  feedback).
- Meaningful commit history explaining the reasoning.
