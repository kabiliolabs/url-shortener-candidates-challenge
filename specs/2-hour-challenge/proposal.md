# URL Shortener Challenge — Work Plan

## Context
Refactor the flawed shortener (audit done previously) within ~2h. Persistence: Postgres + Prisma. Architecture: simplified hexagonal with repository pattern.

## Target architecture
- `libs/engine` — the hexagon core, no I/O:
  - `domain/` entity `ShortUrl`, short-code generator (crypto, base62, len 7), domain errors
  - `ports/` `ShortUrlRepository` interface
  - `application/` use cases `ShortenUrl` (retries on code collision), `ResolveShortUrl`
- `applications/web` — driving adapter (routes) + driven adapter (Prisma) + composition root:
  - `prisma/schema.prisma`, `prisma.config.ts`, migrations
  - `app/.server/config.ts` (env, fail fast), `app/.server/persistence/*` (Prisma client + repository), `app/.server/container.ts` (wiring)
  - routes stay thin: parse input → call use case → map to response
  - Prisma adapter lives in the app, not a separate lib: pnpm isolation + Vite SSR bundling make a source-only lib with runtime deps awkward; move it out if a second deployable (e.g. worker) appears.

## Data model (`applications/web/prisma/schema.prisma`)
```prisma
model ShortUrl {
  shortCode     String    @id @map("short_code") @db.VarChar(16)
  originalUrl   String    @map("original_url") @db.Text
  clicks        Int       @default(0)
  createdAt     DateTime  @default(now()) @map("created_at") @db.Timestamptz(3)
  lastClickedAt DateTime? @map("last_clicked_at") @db.Timestamptz(3)

  @@index([createdAt])
  @@map("short_urls")
}
```
- `shortCode` PK → redirect lookup is a PK index scan; uniqueness backs the collision retry. No extra index needed (PK is already a unique B-tree).
- `clicks` / `lastClickedAt` updated atomically in one `UPDATE` (`{ increment: 1 }`), never read-modify-write.
- `createdAt` index for the stats list ordered newest first.
- Deliberately omitted: `updatedAt`, unique `originalUrl`, creator IP, `userId`/`expiresAt`/per-click events table (see "With more time").

## 2h scope (in order)
1. Postgres + Prisma persistence, hexagonal refactor, collision-safe codes, Docker compose with db + migrate on start  ← current step
2. Input validation (http/https only, length, no self-links) with domain errors → inline form messages
3. Click tracking (atomic increment on redirect) + `/urls` stats list
4. UI redesign: small reusable components, loading states, copy button, proper not-found page
5. Abuse prevention: per-IP rate limit on create
6. Vitest tests for engine use cases (in-memory repository fake)
7. README / CHALLENGE_SUBMISSION.md, verify Docker end-to-end

## With more time
- Redis cache for code → URL lookups so redirects skip Postgres (redirects are the hot path; click counts buffered/async so caching doesn't lose stats)
- Domain blocklist: reject shortening URLs whose host (incl. subdomains) is on a denylist, so users can't hide malicious/unwanted sites behind our links; plus Google Safe Browsing check
- Distributed rate limiting (Redis)
- Per-click analytics (timestamp, referrer, UA, country) and time-series charts
- Users/auth: ownership of links, delete/disable, custom aliases, expiration
- Pagination/search on the stats list
- E2E tests (Playwright) + integration tests against a real Postgres (Testcontainers)
- CI pipeline (typecheck, lint, test, docker build), ESLint/Prettier config
- Slimmer prod image (prune devDeps, non-root user), healthchecks, structured logging/metrics
- QR codes, link previews

## Verification (step 1)
- `docker compose up -d db` → `pnpm db:migrate` → `pnpm dev`: shorten, redirect, restart server, link still works
- `pnpm typecheck`, `pnpm build`
- `docker compose up --build` end-to-end on :3000
