# Setup Guide

This guide walks you through setting up the URL Shortener application after the refactoring.

## Prerequisites

- Node.js 20+ (for development)
- pnpm 10+ (package manager)
- Docker (for containerized deployment)

---

## Local Development Setup

### 1. Install Dependencies

```bash
pnpm install
```

This installs all dependencies for the monorepo including:
- React Router v7 for the web application
- Prisma for database access
- nanoid for short code generation
- All TypeScript tooling

### 2. Setup Database

The application uses SQLite for local development. Initialize the database:

```bash
# Generate Prisma client
pnpm --filter @url-shortener/db prisma generate

# Create database and run migrations
pnpm --filter @url-shortener/db prisma migrate dev --name init
```

This will:
- Create a `dev.db` file in `libs/db/`
- Generate TypeScript types for Prisma models
- Set up the initial database schema

### 3. Configure Environment

Environment variables are already configured in `.env`:

```bash
DATABASE_URL="file:./dev.db"
PUBLIC_URL=http://localhost:5173
NODE_ENV=development
```

### 4. Start Development Server

```bash
pnpm dev
```

This starts:
- Web application on `http://localhost:5173`
- TypeScript compilation in watch mode
- Hot module replacement (HMR)

### 5. Access the Application

- **Main page:** http://localhost:5173
- **Dashboard:** http://localhost:5173/dashboard

---

## Docker Deployment

### Build and Run

```bash
docker-compose up --build
```

The application will be available at `http://localhost:3000`

### How it works

- Uses multi-stage Docker build for optimization
- SQLite database persists in Docker volume `url-data`
- Optimized production build with Node.js 20

### Environment Variables (Docker)

The docker-compose.yml configures:
```yaml
environment:
  - NODE_ENV=production
  - PUBLIC_URL=http://localhost:3000
  - DATABASE_URL=file:/app/data/production.db
```

---

## Database Management

### View Data (Development)

```bash
pnpm --filter @url-shortener/db prisma studio
```

Opens Prisma Studio at `http://localhost:5555` for visual database browsing.

### Create New Migration

After modifying `libs/db/prisma/schema.prisma`:

```bash
pnpm --filter @url-shortener/db prisma migrate dev --name your_migration_name
```

### Reset Database (Development)

```bash
pnpm --filter @url-shortener/db prisma migrate reset
```

⚠️ This deletes all data!

---

## Project Structure

```
url-shortener/
├── libs/
│   ├── engine/              # Domain logic
│   │   ├── src/
│   │   │   ├── validators.ts
│   │   │   ├── short-code.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── db/                  # Database layer
│       ├── prisma/
│       │   └── schema.prisma
│       ├── src/
│       │   └── client.ts
│       └── package.json
│
└── applications/web/
    ├── app/
    │   ├── routes/
    │   │   ├── _index.tsx       # Main form
    │   │   ├── dashboard.tsx     # URL list + stats
    │   │   └── s.$code.tsx       # Redirect handler
    │   ├── lib/
    │   │   └── url-service.server.ts  # Service layer
    │   └── root.tsx
    └── package.json
```

---

## Troubleshooting

### "Module not found: @url-shortener/db"

**Solution:** Install dependencies and generate Prisma client:
```bash
pnpm install
pnpm --filter @url-shortener/db prisma generate
```

### "Database not found" error

**Solution:** Run migrations to create the database:
```bash
pnpm --filter @url-shortener/db prisma migrate dev
```

### TypeScript errors in IDE

**Solution:** Ensure Prisma client is generated:
```bash
pnpm --filter @url-shortener/db prisma generate
```

Then restart your TypeScript server (in VS Code: Cmd+Shift+P → "Restart TypeScript Server")

### Docker container fails to start

**Solution:** Check logs and ensure ports aren't in use:
```bash
docker-compose logs
lsof -i :3000  # Check if port 3000 is occupied
```

---

## Production Considerations

### Migrating to PostgreSQL

1. Update `DATABASE_URL` in environment:
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/urlshortener"
   ```

2. Update Prisma schema provider (libs/db/prisma/schema.prisma):
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. Create and run migrations:
   ```bash
   pnpm --filter @url-shortener/db prisma migrate dev
   ```

### Performance Optimization

Consider adding:
- Redis for caching popular URLs
- CDN for static assets
- Database read replicas for high traffic

### Security Enhancements

Recommended additions:
- Rate limiting middleware
- HTTPS enforcement
- Security headers (helmet.js)
- Error monitoring (Sentry)

---

## Testing (Future)

### Unit Tests

```bash
# Add vitest or jest
pnpm add -D vitest @vitest/ui
pnpm test
```

### E2E Tests

```bash
# Add Playwright
pnpm add -D @playwright/test
pnpm playwright test
```

---

## Useful Commands

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

---

## Next Steps

1. ✅ Setup complete - application is running
2. 📖 Read [REFACTORING_GUIDE.md](./REFACTORING_GUIDE.md) for architecture details
3. 🧪 Add tests for critical functionality
4. 🚀 Deploy to production environment
5. 📊 Set up monitoring and logging

---

## Getting Help

- Review the [REFACTORING_GUIDE.md](./REFACTORING_GUIDE.md) for architecture decisions
- Check [Prisma documentation](https://www.prisma.io/docs)
- Review [React Router v7 documentation](https://reactrouter.com)

---

## Quick Verification

After setup, verify everything works:

1. Visit http://localhost:5173
2. Enter a URL (e.g., https://example.com)
3. Click "Shorten URL"
4. Copy the shortened URL
5. Visit the shortened URL - should redirect
6. Check http://localhost:5173/dashboard - should show the URL with 1 click

If all steps work, your setup is complete! 🎉
