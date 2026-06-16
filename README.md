# URL Shortener

Production-oriented URL shortener built with React Router v7, TypeScript, Prisma, and a layered architecture.

## Architecture

This refactor applies a pragmatic clean architecture split:

- `libs/engine/src/domain`
	- Entities: `ShortUrl`
	- Value Objects: `ShortCode`, `OriginalUrl`
	- Contracts: `ShortUrlRepository`, `ShortCodeGenerator`
- `libs/engine/src/application`
	- Use cases: `CreateShortUrlUseCase`, `RedirectToOriginalUrlUseCase`, `TrackClickUseCase`, `GetUrlStatsUseCase`
	- Structured `AppError`
- `libs/engine/src/infrastructure`
	- Strategy implementation: `NanoIdShortCodeGenerator`
- `applications/web/app/features/url-shortener/server`
	- Prisma repository adapter
	- Basic fixed-window rate limiter
- `applications/web/app/routes`
	- Thin interface layer (`loader` / `action`) that delegates to use cases
- `applications/web/app/features`
	- UI components and hooks split by feature (`url-shortener`, `url-stats`)

## Key Improvements

- Replaced collision-prone short code generation (`abc`, length 2) with nanoid strategy.
- Introduced persistent storage via Prisma + SQLite.
- Added unique DB constraint on `shortCode` and retry logic for collision handling.
- Added click analytics (`clickCount`, `lastClickedAt`) and URL listing with stats.
- Added URL validation and structured error handling with explicit error codes.
- Added basic abuse protection via IP-based rate limiting.
- Refactored UI to reusable components with loading/error states.
- Added unit tests for core use cases.

## Tech Stack

- pnpm workspaces + Turbo
- React 19 + React Router v7
- TypeScript
- Tailwind CSS v4
- Prisma + SQLite
- Vitest

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. Configure environment:

```bash
cp .env.example .env
cp applications/web/.env.example applications/web/.env
```

3. Run DB migration:

```bash
cd applications/web
pnpm prisma:migrate
cd ../..
```

4. Start dev server:

```bash
pnpm dev
```

Open `http://localhost:5173`.

## Build and Typecheck

```bash
pnpm typecheck
pnpm build
```

## Tests

```bash
pnpm -F @url-shortener/engine test
pnpm -F web test
```

## Docker Setup

```bash
docker-compose up --build
```

Container startup runs `prisma migrate deploy` before serving the app.

Open `http://localhost:3000`.
