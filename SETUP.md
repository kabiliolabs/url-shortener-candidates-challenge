# Setup Guide

Complete guide to setting up and running the URL Shortener application.

---

## ⚡ Quick Start (3 Commands)

If you just want to get running fast:

```bash
# 1. Install everything
pnpm install

# 2. Setup database
pnpm --filter @url-shortener/db prisma generate && \
pnpm --filter @url-shortener/db prisma migrate dev --name init

# 3. Start!
pnpm dev
```

**Open:** http://localhost:5173 🎉

> Need more details? Continue reading below.

---

## Prerequisites

Before starting, ensure you have:

- **Node.js 20+** → Check with `node --version`
- **pnpm 10+** → Check with `pnpm --version`
- **Docker** (optional, for containerized deployment) → Check with `docker --version`

**Don't have pnpm?**

```bash
npm install -g pnpm
# or use corepack
corepack enable
```

---

## Local Development Setup

### 1. Install Dependencies

```bash
pnpm install
```

**Expected output:** Should install ~300+ packages without errors.

This installs all dependencies for the monorepo including:

- React Router v7 for the web application
- Prisma for database access
- nanoid for short code generation
- All TypeScript tooling

### 2. Setup Database

The application uses SQLite for local development. Initialize the database:

```bash
# Generate Prisma client (creates TypeScript types)
pnpm --filter @url-shortener/db prisma generate

# Create database and run migrations (creates tables)
pnpm --filter @url-shortener/db prisma migrate dev --name init
```

**Expected output:**

```
✔ Generated Prisma Client
✔ Applied migration: 20XXXXXX_init
```

This will:

- Create a `dev.db` file in `libs/db/`
- Generate TypeScript types for Prisma models
- Set up the initial database schema

**Verify:** Check that `libs/db/dev.db` file was created.

### 3. Configure Environment

**Check if `.env` exists:**

```bash
ls -la .env
```

If the file doesn't exist, copy from example:

```bash
cp .env.example .env
```

**Verify the `.env` file contains:**

```bash
DATABASE_URL="file:./dev.db"
PUBLIC_URL=http://localhost:5173
NODE_ENV=development
```

These are the correct values for local development.

### 4. Start Development Server

```bash
pnpm dev
```

**Expected output:**

```
@url-shortener/engine:dev: Watching for file changes...
web:dev: Local: http://localhost:5173
```

This starts:

- Web application on `http://localhost:5173`
- TypeScript compilation in watch mode
- Hot module replacement (HMR)

### 5. Access the Application

- **Main page:** http://localhost:5173
- **Dashboard:** http://localhost:5173/dashboard

---

## ✅ Verification Checklist

After setup, test these features to ensure everything works:

### 1. Shorten a URL

- [ ] Go to http://localhost:5173
- [ ] Enter `https://example.com` in the form
- [ ] Click "Shorten URL"
- [ ] See success message with short URL
- [ ] Short URL looks like `http://localhost:5173/s/Abc123X`

### 2. Test Redirect

- [ ] Copy the short URL
- [ ] Open it in a new tab
- [ ] Should redirect to `https://example.com`

### 3. Check Dashboard

- [ ] Go to http://localhost:5173/dashboard
- [ ] See your shortened URL listed
- [ ] See click count = 1
- [ ] See creation date

### 4. Test Security Validation

- [ ] Try to shorten `javascript:alert(1)`
- [ ] Should see error: "Only HTTP and HTTPS protocols are allowed"
- [ ] Try to shorten `http://localhost:8080`
- [ ] Should see error: "Cannot shorten internal or private addresses"

**All tests passed?** ✅ You're ready to go!

---

## Docker Deployment

### Prerequisites for Docker

Make sure Docker is installed and running:

```bash
# Check Docker is installed
docker --version

# Check Docker daemon is running
docker ps
```

### Build and Run

```bash
# Build and start in foreground (see logs)
docker-compose up --build

# Or run in background (detached mode)
docker-compose up --build -d
```

The application will be available at `http://localhost:3000`

**Note:** Docker uses port 3000, local development uses port 5173.

### Stop Docker Containers

```bash
# Stop containers
docker-compose down

# Stop and remove volumes (⚠️ deletes database)
docker-compose down -v
```

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

## Troubleshooting

### "Command not found: pnpm"

**Fix:** Install pnpm globally

```bash
npm install -g pnpm
# or
corepack enable
```

### "Module not found: @url-shortener/db"

**Fix:** Install dependencies and generate Prisma client

```bash
pnpm install
pnpm --filter @url-shortener/db prisma generate
```

### "Cannot find module '.prisma/client'"

**Fix:** Install dependencies and regenerate

```bash
pnpm install
pnpm --filter @url-shortener/db prisma generate
```

### "Database not found" or "P1003: Database does not exist"

**Fix:** Run migrations to create the database

```bash
pnpm --filter @url-shortener/db prisma migrate dev
```

### "Port 5173 already in use"

**Fix:** Kill the process using that port

```bash
# macOS/Linux
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5173
# Then: taskkill /PID <PID> /F

# Or change port in vite config
```

### TypeScript errors in IDE

**Fix:** Ensure Prisma client is generated and restart TypeScript server

```bash
pnpm --filter @url-shortener/db prisma generate
```

Then restart your TypeScript server:

- **VS Code:** `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows) → "Restart TypeScript Server"
- **Other editors:** Restart the editor

### Docker container fails to start

**Solution 1:** Check logs for specific errors

```bash
docker-compose logs
```

**Solution 2:** Ensure port 3000 isn't in use

```bash
# macOS/Linux
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

**Solution 3:** Rebuild from scratch

```bash
docker-compose down -v
docker-compose up --build
```

**Solution 4:** Check Docker daemon is running

```bash
docker ps
```

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

## Useful Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm typecheck              # Type-check all packages

# Database
pnpm --filter @url-shortener/db prisma studio      # Visual DB browser (localhost:5555)
pnpm --filter @url-shortener/db prisma migrate dev # Create new migration
pnpm --filter @url-shortener/db prisma generate    # Generate Prisma client
pnpm --filter @url-shortener/db prisma migrate reset # Reset database (⚠️ deletes all data)

# Docker
docker-compose up           # Start containers
docker-compose up --build   # Rebuild and start
docker-compose up -d        # Start in background
docker-compose down         # Stop containers
docker-compose logs         # View logs
docker-compose down -v      # Stop and remove volumes
```

---

## Next Steps

Once everything is running:

1. **Explore the code:**
   - `applications/web/app/routes/` - Route handlers
   - `libs/engine/src/` - Business logic
   - `libs/db/prisma/schema.prisma` - Database schema

2. **Read the documentation:**
   - [README.md](./README.md) - Overview and features
   - [REFACTORING_GUIDE.md](./REFACTORING_GUIDE.md) - Architecture deep dive

3. **Extend the application:**
   - Customize the UI colors
   - Add new features (custom codes, QR codes, expiration)
   - Deploy to production

---

## Learning Resources

- **React Router v7:** https://reactrouter.com
- **Prisma ORM:** https://www.prisma.io/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **nanoid:** https://github.com/ai/nanoid

---

## Getting Help

- Review this guide for setup instructions
- Check [REFACTORING_GUIDE.md](./REFACTORING_GUIDE.md) for architecture decisions

---

**Happy coding! 🚀**
