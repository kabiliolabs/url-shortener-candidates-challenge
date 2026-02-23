# URL Shortener

Refactored full-stack URL shortener using DDD + Hexagonal Architecture.

## Architecture

```
url-shortener/
├── applications/web/              # React Router app (driving adapter)
│   └── app/server/                # HTTP concerns (IP extraction, error mapping)
└── libs/engine/                   # Core business logic
	├── src/domain/                # Entities + value objects
	├── src/application/           # Ports + use cases
	├── src/infrastructure/        # Prisma, ID generator, rate limiting
	└── prisma/schema.prisma       # SQLite model
```

### Core design decisions

- Domain validates `OriginalUrl` and `ShortCode` through value objects.
- Use cases (`create`, `resolve`, `list`) depend on ports, not concrete tech.
- Prisma repository implements persistence port.
- Fixed-window rate limiter implements abuse-protection port.
- Web routes call application services and map errors to HTTP responses.

## Features

- Create unique short links.
- Redirect `/s/:code` to original URL.
- Track click count + last visit timestamp.
- Persist data in SQLite (survives restarts with Docker volume).
- Input validation + robust error messages.
- Loading state and modern, consistent UI.

## Tech Stack

- React + React Router v7 (SSR)
- TypeScript
- Tailwind CSS v4
- Prisma + SQLite
- Vitest (critical use case tests)

## Local Setup

```bash
corepack pnpm install
cp .env.example .env
corepack pnpm --filter @url-shortener/engine prisma:generate
corepack pnpm --filter @url-shortener/engine db:push
corepack pnpm dev
```

App: `http://localhost:5173`

## Docker Setup

```bash
docker-compose up --build
```

App: `http://localhost:3000`

Notes:

- The app runs schema sync on startup (`db:deploy`).
- SQLite file is mounted in Docker volume `url_shortener_data` at `/data/url-shortener.db`.
