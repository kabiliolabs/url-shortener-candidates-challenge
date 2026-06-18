# Submission

## What I Did

### Persistence (PostgreSQL + Prisma)

- Added a `libs/database` package with Prisma ORM and PostgreSQL via Docker Compose.
- Created a `UrlDatabase` model storing `url`, `shortCode`, `shortenCount`, `clickCount`, and timestamps.
- Implemented a repository-style `url.controller.ts` with `createUrl`, `getAllUrls`, and `resolveShortCode`.
- Data survives server restarts; migrations and seed scripts are wired into the monorepo.

### Core features

- **URL shortening**: form on the home page creates a short link and displays it with a copy-friendly component.
- **Redirects**: `/s/:code` resolves the short code from the database and redirects to the original URL.
- **Click tracking**: each redirect increments `clickCount`; re-shortening the same URL increments `shortenCount` instead of creating a duplicate.
- **Statistics page** (`/urls`): lists all URLs with click/shorten counts, summary cards, and a refresh button with loading state.

### Code generator

- Replaced the collision-prone 1-character generator (9 possible codes) with a 6-character alphanumeric code using `crypto.randomInt` (~56 billion combinations).

### Frontend

- Integrated **shadcn/ui** (Button, Card, Input, Table, Badge) with Tailwind CSS for a clean, consistent UI.
- Extracted reusable components: `UrlForm`, `ShortenedUrlDisplay`, `UrlStatsTable`.
- Added client-side validation (`type="url"`, `required`) and server-side error feedback displayed inline.

### Error handling & typing

- Introduced an `AppError` class with error codes for database failures.
- Handled Prisma-specific errors (unique constraint violations, record not found).
- Added a shared `Url` type on the frontend; loader data serializes dates to ISO strings for the stats table.

### Infrastructure

- Updated Docker setup (PostgreSQL service, env variables, Dockerfile) and README with local and Docker instructions.

### Not covered (time constraints)

- Automated tests
- Advanced security (rate limiting, SSRF protection, URL allowlisting)

## What I Would Do With More Time

<!-- What would you tackle next if you had more time? -->

## AI Usage

<!-- How did you use AI tools (if any)? Include some example prompts if you used any agent. -->

## Feedback

<!-- Any feedback on the challenge? Was it clear? Too easy/hard? Suggestions? -->
