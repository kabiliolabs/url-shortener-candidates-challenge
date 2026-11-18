# Submission

## What I Did

In this challenge I prioritized restructuring the existing code over adding a lot of new features.
I improved the application by adding useful functionality and fixing parts that were
inconsistent. With only two hours and several refactors and new features to cover, I wrote
an implementation plan for AI agents to execute, which simplified my own workflow.

### 1. Persistence — Prisma 7 + SQLite

- Added a `ShortenedUrl` model (`cuid` id, unique `shortCode`, `originalUrl`,
  `clickCount`, `createdAt`, nullable `deletedAt`) and committed the initial migration.
- Used Prisma 7 with the libSQL driver adapter so SQLite works consistently in Docker
  without relying on native engine binaries.
- Kept Prisma behind a `UrlRepository` port. `PrismaUrlRepository` maps database records
  to domain entities, so use cases do not know Prisma exists.
- The database path is resolved from `DATABASE_URL` relative to the repo root, and the
  parent directory is created automatically. Docker mounts a named volume on `/app/data`
  and runs `prisma migrate deploy` on startup, so data survives restarts.

### 2. Short code generation — nanoid(8)

- Replaced the original generator with `nanoid`, using a 62-character alphabet and
  8-character codes: **≈218 trillion** possible combinations.
- Uniqueness is enforced twice: a pre-insert `existsByCode` check with retries, plus the
  database unique constraint. The latter is caught as `DuplicateShortCodeError` and
  retried, which protects against race conditions.
- Retries are bounded, and the generator is injectable and configurable (alphabet,
  length, attempts).

### 3. Input validation — Zod

- `createShortUrlSchema` in the engine: trims input, caps length at 2048 characters, and requires `http`/`https`.
- Validation runs inside `CreateShortUrlUseCase`, so the rule cannot be bypassed by calling the action directly.

### 4. Architecture — DDD-style layers

- `domain/`: entity, repository port, and typed domain errors.
- `application/`: use cases (create, redirect, list, stats, delete), code generator, and
  validation schema.
- `infrastructure/`: Prisma client, repository implementation, and environment config.
- `container.ts`: composition root that wires implementations to use cases. React Router
  loaders and actions only orchestrate and translate results to HTTP.

### 5. Error handling

- A `DomainError` base class plus `InvalidUrlError`, `UrlNotFoundError`, and
  `DuplicateShortCodeError`.
- Unknown or deleted codes render a dedicated 404 page; unexpected errors hit the root
  error boundary, with stack traces shown only in development.

### 6. Statistics and link management

- `/stats`: lists active links with their statistics and a two-step delete confirmation.
- `/stats/:code`: detail view with clicks, creation time, status, short link, and original
  URL.
- `/s/:code`: redirects to the original URL and increments the click counter.

### 7. UI redesign

- Uses Tailwind CSS with a cream/moss/forest/sage palette, responsive layouts, automatic
  light/dark mode, and reusable components such as `ErrorPage` and `DeleteUrlButton`.

## What I Would Do With More Time

There are several points I consider important but did not develop due to time constraints:

- **Tests** for the engine and the web app. The different backend layers and the
  frontend components need tests to confirm their behavior and catch future regressions.
- **Abuse prevention**: rate-limit repeated requests per IP and add authentication
  with per-link ownership, since `/stats` and delete are currently public.
- **Security headers** (CSP, `X-Content-Type-Options`, `X-Frame-Options`) in `root.tsx`.
- **Accessibility review** of the form and statistics views.
- **Non-essential features**, such as a copy-to-clipboard button, custom aliases, or QR
  codes.

## AI Usage

I used **OpenCode** as my coding agent throughout.

- I asked for an implementation plan based on my guidelines (Prisma, architecture changes,
  UI style, etc.) to improve and speed up the task. After a small iteration on
  some prompts, I had an effective action plan for my needs.
- I applied the steps one by one with AI agents, reviewing and improving the result.
- I audited the final result to identify weak points and features that could be added
  next.

## Feedback

Interesting challenge: refactoring existing code instead of building from scratch feels
more realistic. I like the tight two-hour limit because it forces prioritization. AI makes
it possible to cover many features and architectural changes in that time, so the
evaluation ends up focusing on judgment and prioritization rather than raw output.
