# URL Shortener

A production-ready URL shortener with persistence, click tracking, and a modern UI.

## Features

✅ **Persistent Storage** - SQLite (dev) / PostgreSQL (production) with Prisma ORM  
✅ **Collision-Resistant Codes** - nanoid with 1.6 trillion combinations  
✅ **Click Analytics** - Track clicks with metadata (user agent, referer)  
✅ **Input Validation** - Security-hardened URL validation  
✅ **Modern UI** - Clean, responsive design  
✅ **Docker Ready** - Containerized for easy deployment  

## Tech Stack

```
url-shortener/
├── applications/web/    # React + React Router v7
├── libs/engine/         # Domain logic (validators, generators)
└── libs/db/             # Database layer (Prisma + SQLite)
```

| Technology                                    | Description                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [pnpm](https://pnpm.io/)                      | Fast, disk-efficient package manager with built-in monorepo support via workspaces                |
| [Turbo](https://turbo.build/)                 | High-performance build system for monorepos. Runs tasks in parallel and caches results            |
| [React](https://react.dev/)                   | Library for building user interfaces with components                                              |
| [React Router v7](https://reactrouter.com/)   | Full-stack React framework. Handles routing, data loading (loaders), mutations (actions), and SSR |
| [Prisma](https://www.prisma.io/)              | Next-generation ORM for Node.js and TypeScript                                                    |
| [TypeScript](https://www.typescriptlang.org/) | Typed superset of JavaScript for catching errors at compile time                                  |
| [Tailwind CSS](https://tailwindcss.com/)      | Utility-first CSS framework for rapid UI development                                              |
| [Vite](https://vite.dev/)                     | Fast build tool and dev server with hot module replacement                                        |
| [nanoid](https://github.com/ai/nanoid)        | Secure, URL-friendly unique ID generator                                                          |

## Quick Start

> 🚀 **First time?** See [SETUP.md](./SETUP.md) for a step-by-step guide with troubleshooting.

### Local Development

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment file (if needed)
cp .env.example .env

# 3. Setup database
pnpm --filter @url-shortener/db prisma generate
pnpm --filter @url-shortener/db prisma migrate dev --name init

# 4. Start dev server
pnpm dev
```

Open `http://localhost:5173`

### Docker Setup

```bash
# Build and run in production mode
docker-compose up --build
```

Open `http://localhost:3000`

**Note:** Docker runs on port 3000, local development on port 5173.

## Documentation

- **[SETUP.md](./SETUP.md)** - 🚀 Complete setup guide (quick start + troubleshooting)
- **[REFACTORING_GUIDE.md](./REFACTORING_GUIDE.md)** - Architecture, design decisions, and implementation details
- **[CHALLENGE_DESCRIPTION.md](./CHALLENGE_DESCRIPTION.md)** - Original challenge requirements

## Application Routes

- `/` - Main page with URL shortening form
- `/dashboard` - View all URLs with statistics
- `/s/:code` - Redirect endpoint (e.g., `/s/Abc123X`)

## Architecture Highlights

### Service Layer Pattern
Clean separation between routes (presentation), service (business logic), and Prisma (data access).

### Security Features
- Protocol whitelist (HTTP/HTTPS only)
- Private IP address blocking (SSRF prevention)
- URL length limits (DoS prevention)
- Input validation with custom error messages

### Click Tracking
- Atomic click count updates
- Detailed event logging (timestamp, user agent, referer)
- Dashboard with analytics visualization

### Collision Handling
- nanoid with 57-character alphabet
- 7-character codes = ~1.6 trillion combinations
- Defensive retry logic for edge cases

## Project Structure

```
├── applications/web/
│   └── app/
│       ├── routes/
│       │   ├── _index.tsx       # Main form
│       │   ├── dashboard.tsx     # Analytics dashboard
│       │   └── s.$code.tsx       # Redirect handler
│       └── lib/
│           └── url-service.server.ts  # Business logic
├── libs/
│   ├── engine/
│   │   └── src/
│   │       ├── validators.ts     # URL validation with security
│   │       ├── short-code.ts     # nanoid code generation
│   │       └── types.ts          # TypeScript definitions
│   └── db/
│       ├── prisma/
│       │   └── schema.prisma     # Database schema
│       └── src/
│           └── client.ts         # Prisma singleton
└── [configuration files]
```

## Development Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm typecheck              # Type-check all packages

# Database
pnpm --filter @url-shortener/db prisma studio      # Visual DB browser
pnpm --filter @url-shortener/db prisma migrate dev # Create migration
pnpm --filter @url-shortener/db prisma generate    # Generate client

# Docker
docker-compose up           # Start in Docker
docker-compose down         # Stop containers
docker-compose logs         # View logs
```

## Environment Variables

```bash
DATABASE_URL="file:./dev.db"           # SQLite for dev
PUBLIC_URL=http://localhost:5173        # Base URL for short links
NODE_ENV=development                    # Environment
```

## Migration to PostgreSQL

Simply change the `DATABASE_URL`:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/urlshortener"
```

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Run migrations:
```bash
pnpm --filter @url-shortener/db prisma migrate deploy
```

## Contributing

See [REFACTORING_GUIDE.md](./REFACTORING_GUIDE.md) for architectural decisions and patterns used in this project.
