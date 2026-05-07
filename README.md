# URL Shortener — Jaime Cabrera (Challenge)

This branch is a full rewrite of the original URL Shortener, built to incorporate modern architectural patterns, the latest versions of the stack libraries, and significant functional and design improvements.

---

## Improvements over the original codebase

### Architecture

| Aspect           | Original                                             | This version                                                  |
| ---------------- | ---------------------------------------------------- | ------------------------------------------------------------- |
| Structure        | Domain logic in `libs/engine/` separate from the app | CQRS with `core/commands/` and `core/queries/` inside the app |
| Errors           | Generic or unmodeled errors                          | Typed domain errors with Effect-TS `Data.TaggedError`         |
| Data access      | Direct, no abstraction                               | Port (`repository.ts`) + Prisma adapter (`repo.server.ts`)    |
| Effects handling | `async/await` with `try/catch`, no typed errors      | Effect-TS: fully typed, composable error channel              |
| Database         | No ORM or outdated version                           | Prisma 7 (latest) with native driver `@prisma/adapter-pg`     |

### New features

- **URL deduplication**: if a link already exists for a given URL, it returns the existing one instead of creating a duplicate
- **Click tracking**: every redirect increments the click counter and records `lastClickAt`
- **Full history page** (`/links`): table with all shortened URLs, click counts, and timestamps
- **In-memory rate limiting**: prevents abuse by limiting the number of shortening requests per client/IP per time window
- **Collision-safe code generation**: retries up to 3 times with a new code before returning a `CodeCollisionError`
- **Proper 404 page** for unknown codes at `/go/:code`

### Design & UX

- **Dark mode** with toggle button, `localStorage` persistence, and OS preference detection
- **No theme flash** (ThemeScript injected in `<head>` before React hydrates, preventing FOUC)
- **Lexend typeface** for improved readability
- **"Already shortened" badge** when a URL was previously shortened
- **Loading state** on the submit button while the request is in flight
- **Pointer cursor** on all interactive elements; `not-allowed` on disabled buttons
- Design based on the visual guidelines provided in the challenge brief (colors, star button, layout)

---

## Tech stack

| Technology                                    | Version | Purpose                                                           |
| --------------------------------------------- | ------- | ----------------------------------------------------------------- |
| [React](https://react.dev/)                   | 19      | Declarative component-based UI                                    |
| [React Router v7](https://reactrouter.com/)   | 7.12    | Full-stack framework: loaders, actions, SSR, routing              |
| [Effect-TS](https://effect.website/)          | 3.21    | Typed effects, domain errors, functional composition              |
| [Prisma](https://www.prisma.io/)              | 7.8     | Type-safe ORM with migrations; new v7 API with `prisma.config.ts` |
| [Jotai](https://jotai.org/)                   | 2.20    | Atomic global state; persists theme preference in `localStorage`  |
| [Tailwind CSS](https://tailwindcss.com/)      | 4.1     | Utility-first styling; dark mode via `@custom-variant`            |
| [nanoid](https://github.com/ai/nanoid)        | 5       | Secure unique short code generation                               |
| [TypeScript](https://www.typescriptlang.org/) | 5.9     | End-to-end static typing                                          |
| [Vite](https://vite.dev/)                     | 7       | Build tool and dev server with HMR                                |
| [pnpm](https://pnpm.io/)                      | —       | Fast package manager with workspace support                       |
| [Turbo](https://turbo.build/)                 | —       | Monorepo build orchestrator with caching                          |
| [PostgreSQL](https://www.postgresql.org/)     | —       | Relational database                                               |
| [Docker](https://www.docker.com/)             | —       | Local Postgres container for development                          |

---

## Architecture — CQRS + Ports & Adapters

```
app/
  core/                        ← Pure domain (no framework dependencies)
    errors.ts                  ← Domain errors (Effect TaggedError)
    repository.ts              ← Port: LinkRepository interface
    short-code.ts              ← Code generation and validation
    commands/
      shorten.ts               ← Command: validate URL, rate-limit, deduplicate, create
    queries/
      links.ts                 ← Queries: resolveAndTrack, listRecent, listAll
  infra/                       ← Infrastructure (replaceable without touching core/)
    db.server.ts               ← Prisma singleton (adapter)
    repo.server.ts             ← Adapter: implements LinkRepository using Prisma
  routes/
    home.tsx                   ← / — shortener form + recent links
    go.$code.tsx               ← /go/:code — redirect (increments click count)
    links.tsx                  ← /links — full history table
  components/
    AppHeader.tsx              ← Header with navigation and dark mode toggle
    ShortenerCard.tsx          ← Shortener form with visual feedback
    RecentLinks.tsx            ← Most recently shortened links list
    LinksTable.tsx             ← Full table with click counts and timestamps
    DarkModeToggle.tsx         ← Light/dark theme toggle
    AppFooter.tsx              ← Page footer
  atoms.ts                     ← Jotai global state (theme)
  root.tsx                     ← Root layout with anti-flash ThemeScript
```

**Core rule:** `core/` never imports from `infra/`. The domain only knows the `LinkRepository` interface — it has no knowledge of Prisma or Postgres. Swapping the database only requires changing `infra/`.

---

## Request flow — shortening a URL

```
User submits the form
        │
        ▼
  action() in home.tsx   (server — React Router)
        │
        ├─ makeShortenCommand(repo)(url, clientKey)
        │         │
        │         ├─ checkRateLimit()  →  RateLimitError if limit exceeded
        │         ├─ parseUrl()        →  InvalidUrlError if URL is invalid
        │         ├─ findByUrl()       →  returns existing link if already shortened
        │         └─ tryCreate()       →  generates code, retries on collision
        │
        ├─ Effect.matchEffect({ onSuccess, onFailure })
        └─ data({ ok, shortUrl | error })
                  │
                  ▼
        React Router automatically revalidates the loader
                  │
                  ▼
        UI shows the short link and the updated list
```

---

## Local setup

### Requirements

- Node.js ≥ 22
- pnpm ≥ 9
- Docker (for Postgres)

### Steps

```bash
# 1. Install dependencies
pnpm install

# 2. Environment variables
cp .env.example .env
# Edit .env and set: DATABASE_URL="postgresql://postgres:postgres@localhost:5432/urlshortener"

# 3. Start Postgres with Docker
docker-compose up -d postgres

# 4. Apply migrations
cd applications/web
npx prisma migrate dev --name init

# 5. Start the app
cd ../..
pnpm dev
```

Open `http://localhost:5173`

### Full Docker setup

```bash
docker-compose up --build
```

Open `http://localhost:3000`

---

## Database schema

```prisma
model Link {
  id          String    @id @default(cuid())
  code        String    @unique         // generated short code (e.g. "aB3kR7z")
  originalUrl String    @unique         // ensures deduplication
  clickCount  Int       @default(0)
  createdAt   DateTime  @default(now())
  lastClickAt DateTime?                 // timestamp of the last redirect
}
```

---

## Environment variables

| Variable       | Description                  | Example                                                      |
| -------------- | ---------------------------- | ------------------------------------------------------------ |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/urlshortener` |
| `NODE_ENV`     | Runtime environment          | `development` / `production`                                 |
