# Submission

## What I Did

I did a full rewrite of the original codebase, keeping the same stack (React Router v7, TypeScript, Tailwind) but restructuring everything around CQRS and Ports & Adapters, and upgrading all dependencies to their latest versions.

**Architecture — CQRS + Ports & Adapters**

The original had all logic mixed in the route handlers with no separation of concerns. I introduced:

- `core/commands/shorten.ts` — the write side: validates the URL, enforces rate limiting, deduplicates, and creates the link with collision-safe code generation (up to 5 retries)
- `core/queries/links.ts` — the read side: resolves short codes, increments click counts, lists recent and all links
- `core/repository.ts` — a typed interface (`LinkRepository`) that the domain depends on, with no knowledge of Prisma or any database
- `infra/repo.server.ts` — the Prisma adapter that implements the interface; the only place that knows about SQL

This means the entire domain (`core/`) is testable without a database, and swapping the persistence layer requires touching only `infra/`.

**Effect-TS for typed errors**

All domain errors are modeled with `Data.TaggedError` — `InvalidUrlError`, `CodeCollisionError`, `LinkNotFoundError`, `RateLimitError`. Effect's fully typed error channel means TypeScript enforces that every error case is handled before the response is sent. No untyped `catch (e: unknown)` anywhere in domain code.

**Prisma 7 (latest)**

Upgraded from the original setup to Prisma 7.8 with the new `prisma.config.ts` configuration style and the native `@prisma/adapter-pg` driver. The schema adds `clickCount` and `lastClickAt` fields to track redirect statistics.

**Persistence and data model**

- `originalUrl` is marked `@unique` in the schema, which enforces deduplication at the database level in addition to the application-level check
- `clickCount` and `lastClickAt` are updated atomically on every redirect
- Docker Compose wires a persistent Postgres volume so data survives restarts

**Security**

In-memory rate limiter per client IP (10 requests/minute). Requests over the limit fail immediately with a `RateLimitError` before touching the database.

**Frontend**

- Clean UI built with Tailwind v4 and the Lexend typeface
- Dark mode toggle with `localStorage` persistence and OS preference detection; a `ThemeScript` injected in `<head>` prevents any flash of wrong theme on load
- "Already shortened" badge when a URL already exists
- Loading state on the submit button while the request is in flight
- `/links` page with a full history table showing click counts and last-click timestamps
- Copy-to-clipboard button on every link

**Testing**

25 tests across three files:

- `core/__tests__/shorten.test.ts` — unit tests for the shorten command: valid URL, duplicate URL, empty/invalid/too-long URL, rate limit per client
- `core/__tests__/links.test.ts` — unit tests for the links query: resolve and track, not-found, invalid code format, click count increments, listRecent, listAll
- `routes/__tests__/home.test.ts` — integration tests for loader and action with `vi.mock` replacing Prisma with the in-memory repo

All tests run without a database.

---

## What I Would Do With More Time

- **Shadcn/Radix UI components** — the challenge suggests Radix; I built custom components for speed but shadcn would give better accessibility out of the box
- **Persistent rate limiting** — the current in-memory rate limiter resets on server restart and doesn't work across multiple instances. Redis would be the right solution
- **Custom short codes** — let the user choose a vanity code (e.g. `/go/my-brand`) with a fallback to auto-generation if taken
- **QR code generation** — for each shortened link
- **Effect Layers** — the current code passes the repository manually to each command/query factory. Wrapping it in an Effect Layer and using `Effect.provide` would make the wiring cleaner and improve testability further
- **E2E tests** — Playwright to cover the full redirect flow from browser to database

---

## AI Usage

I used Cursor (Claude Sonnet) as a pair programmer throughout the session. The AI helped with boilerplate, architecture decisions, and debugging type errors — but all design decisions were made by me after reviewing the suggestions.

**Example prompts:**

- _"Rewrite the entire URL shortener from scratch on a new branch. Use CQRS with core/commands and core/queries, Effect-TS for typed domain errors, Prisma 7 with @prisma/adapter-pg, React Router v7 loaders and actions, Jotai for global state, Tailwind v4 with @custom-variant dark. The repository interface must be defined in core/ with no Prisma dependency, and the Prisma adapter lives in infra/."_

- _"Add a dark mode toggle with system preference detection, localStorage persistence via atomWithStorage from Jotai, and inject a ThemeScript in <head> to prevent flash of wrong theme before React hydrates."_

- _"Generate unit tests for makeShortenCommand covering: valid URL creates a link, duplicate URL returns existing with isNew:false, empty string fails with InvalidUrlError(empty), whitespace-only string fails with InvalidUrlError(empty), non-URL string fails with InvalidUrlError(format), ftp:// protocol fails with InvalidUrlError(format), URL over 2048 chars fails with InvalidUrlError(too_long), 11th request from same client key fails with RateLimitError, and different client keys are rate-limited independently."_

- _"Generate integration tests for the home route loader and action using vi.mock to replace the Prisma adapter with an in-memory implementation. Cover: loader returns empty array with no data, loader returns links with correct shortUrl shape, action returns ok:true and shortUrl for valid URL, action returns isNew:false for duplicate, action returns ok:false for empty URL, action returns ok:false for invalid URL format."_

- _"Fix prisma.config.ts TypeScript error: 'migrate' does not exist in type PrismaConfig. Check what the actual PrismaConfig type allows in Prisma 7.8 and update accordingly."_

---

## Feedback

The challenge is well scoped and genuinely interesting. The two-hour limit forces real prioritisation decisions — you can't do everything, so you reveal what you actually value.

Permitting and encouraging AI use is a smart call. It shifts the evaluation from "can you remember syntax" to "can you make good architectural decisions and explain them", which is far more relevant to how good engineers actually work.

One suggestion: the `CHALLENGE_DESCRIPTION.md` mentions Radix/shadcn as a component library option but the starter has no installation set up. A note saying "feel free to add it" (which I assume is the intent) would remove any ambiguity about whether modifying `package.json` is allowed.
