# 🔗 URL Shortener

A full-stack URL shortener: paste a long link, get a short one, track clicks. Built with React Router, PostgreSQL, and a clean separation between frontend and backend.

---

## 📋 Prerequisites

- 🟢 **Node.js** 18 or newer — [nodejs.org](https://nodejs.org/)
- 📦 **pnpm** (optional but recommended) — [pnpm.io](https://pnpm.io/) — or use `npx pnpm` in the steps below
- 🐳 **Docker** (optional) — only if you want to run the app or PostgreSQL in containers — [docker.com](https://www.docker.com/products/docker-desktop/)

---

## ⚡ Quick start (local dev)

```bash
# 1. Install dependencies
pnpm install
# or: npx pnpm install

# 2. Copy env and add your DATABASE_URL (see Database setup below)
cp .env.example .env

# 3. Start the app
pnpm dev
```

Then open **http://localhost:5173**.

If you haven’t set up the database yet, follow **Database setup** below first.

---

## 🛠️ Project setup (step by step)

### 1. 📥 Clone and install

```bash
git clone <repo-url>
cd url-shortener-candidates-challenge
pnpm install
```

### 2. 🔐 Environment variables

Create a **`.env`** file in the **project root** (same folder as `package.json` and `docker-compose.yml`):

```env
# Required for the app and Prisma
DATABASE_URL="postgresql://urlshortener:urlshortener@localhost:5432/urlshortener"

# Optional: base URL for short links (defaults to request host)
PUBLIC_URL=http://localhost:5173
```

- When you run `pnpm dev` from the root, the app reads `.env` from the root.
- When you run Prisma from `applications/web`, it looks for `.env` in **`applications/web`**. Either copy the same `DATABASE_URL` there or set it in the shell when running migrations.

### 3. 🗄️ Database setup

The app uses **PostgreSQL** and **Prisma**.

**Start PostgreSQL**

- **With Docker (easiest)** — from the project root:

  ```bash
  docker-compose up -d postgres
  ```

  This starts Postgres on port **5432** with user `urlshortener`, password `urlshortener`, database `urlshortener`.

- **Without Docker** — install PostgreSQL and create a database, then set `DATABASE_URL` in `.env` to match (format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`).

**Run migrations** 📤

From the project root:

```bash
cd applications/web
npx prisma migrate deploy
```

If `DATABASE_URL` is only in the root `.env`, either copy it to `applications/web/.env` or run:

```bash
# PowerShell (from repo root)
$env:DATABASE_URL="postgresql://urlshortener:urlshortener@localhost:5432/urlshortener"; cd applications/web; npx prisma migrate deploy
```

**Check that it works (optional)** ✅

```bash
cd applications/web
npx prisma studio
```

Opens http://localhost:5555 so you can browse the `ShortenedUrl` table.

For more detail, see **[applications/web/DATABASE.md](applications/web/DATABASE.md)**.

### 4. 🚀 Run the app

From the **project root**:

```bash
pnpm dev
```

Open **http://localhost:5173**.

---

## 🎯 How the app works

1. **🏠 Home** — User enters a long URL and clicks *Shorten*. The app validates it, generates a short code, stores it in PostgreSQL, and shows the short link (e.g. `http://localhost:5173/s/abc123`). Copy is one click.
2. **🔀 Short link** — Visiting `/s/<code>` looks up the original URL, increments the click count, and redirects the browser.
3. **📊 All URLs** — Lists every shortened URL with short code, original URL, click count, and creation date. Clicking a short code opens the link (in a new tab); the list updates the click count in the UI when you click.

**Backend:** Routes call **handlers** and **loaders**; they use **services** (validation, code generation) and a **repository** (Prisma/PostgreSQL). Server-only code lives under `app/server/` so the frontend never bundles it.

**Frontend:** React components and Jotai state for the shorten form and URL list. The list is stored in a single atom; clicking a short link increments the displayed count immediately. API client (`app/api/`) talks to `/api/shorten` and `/api/urls`.

For the full backend and frontend layout, see **[applications/web/BACKEND.md](applications/web/BACKEND.md)** and **[applications/web/FRONTEND.md](applications/web/FRONTEND.md)**.


---

## 📖 How to use the app (step by step)

Once the app is running (local: **http://localhost:5173** or Docker: **http://localhost:3000**), follow these steps to use it.

### Step 1 — Open the app

In your browser, go to the app URL. You’ll see the **Home** page with the title “Shorten a URL”, an input field for the URL, and a **Shorten** button. The top bar has **URL Shortener** (home) and **All URLs** (list of links).

### Step 2 — Shorten a URL

1. Click in the **URL** field and paste or type a long URL (e.g. `https://example.com/very/long/path`).
2. Click **Shorten**.
3. The app checks that the URL is valid (http or https). If it’s invalid or empty, an error message appears under the field.
4. If it’s valid, the app creates a short link. A new field appears: **Shortened URL** with a link like `http://localhost:5173/s/abc123`. You can copy it with the copy button next to it.

### Step 3 — Copy the short link

Click the **copy** (📋) button next to the shortened URL. The link is copied to the clipboard; you can paste it anywhere to share.

### Step 4 — Visit a short link

Open the short link (e.g. in the same or another tab). The app looks up the original URL, increments the click count, and **redirects** you to the original site. The short link is a redirect, not a landing page.

### Step 5 — View all URLs and click counts

1. In the top bar, click **All URLs**.
2. You’ll see a table with: **Short code**, **Original URL**, **Clicks**, **Created**.
3. Click a short code (e.g. `/s/abc123`) to open that link in a new tab. The **Clicks** value for that row updates **immediately** when you click (the app tracks it in the list).
4. Use this page to see every shortened URL and how many times each was clicked.

### Tips

- **Empty or invalid URL:** The form shows an error under the field (e.g. “Please enter a URL”). Correct the URL and try again.
- **Too many requests:** The shorten endpoint is rate-limited. If you hit the limit, wait a minute and try again.
- **Clicks count outdated:** If you opened a short link in another tab (e.g. from a bookmark), the All URLs table may show an old count. Refresh the page or navigate away and back to All URLs to load the latest data. Clicking a short code from the table itself updates the count right away.

---

## 🐳 Docker (full stack)

Run the whole app and database in Docker:

**Prerequisites:** Docker Desktop installed and running.

From the project root:

```bash
docker-compose up --build
```

First run may take a few minutes. When the server is ready, open **http://localhost:3000**.

- Stop: `Ctrl+C`. Run in background: `docker-compose up --build -d`.

---

## ✨ What changed from the original app

The original codebase was deliberately minimal: in-memory storage, a tiny set of short codes (collision-prone), no validation, no click stats, and no structure. This refactor does the following:

| Area | Original | Now |
|------|----------|-----|
| 🗄️ **Storage** | In-memory, lost on restart | PostgreSQL + Prisma, persistent |
| 🎲 **Short codes** | Very few possibilities, collisions likely | 6-character alphanumeric (62^6), collision handling with retries |
| ✔️ **Validation** | None | URL format and length (client + server), request body parsing |
| 📈 **Clicks** | Not tracked | Stored per link, shown in “All URLs” and updated when you click the link |
| 🏗️ **Structure** | Mixed concerns | Clear layers: routes → handlers/loaders → services → repository → db |
| 🎨 **UI** | Basic | MUI + Tailwind, theme, reusable components, loading and error states |
| 🛡️ **Abuse** | None | Rate limit on shorten endpoint (in-memory, per key) |
| 💬 **Errors** | Raw or missing | Centralized messages (server constants, frontend error mapping) |
| 🧪 **Testing** | None | Vitest: short-code, URL validation, request body parsing, and key UI flows |

So: **persistent data**, **reliable short codes**, **validation and safety**, **click tracking**, **clear architecture**, and **tests** on important paths.

---

## 🧩 Tech stack and what it adds

| Technology | Role in this project |
|------------|----------------------|
| ⚛️ **React** | UI components and form handling. |
| 🛣️ **React Router v7** | Routing, loaders (e.g. redirect for `/s/:code`), API route handlers, and clear split between server and client code. |
| 📘 **TypeScript** | Types for API contracts, server DTOs, and components; fewer runtime surprises. |
| ⚡ **Vite** | Fast dev server and builds; tree-shakes server-only modules (`.server.ts`). |
| 🎨 **Tailwind CSS** | Utility classes and theme variables for layout and theming. |
| 📦 **MUI (Material UI)** | Buttons, inputs, table, and theme so the UI is consistent and accessible. |
| ⚛️ **Jotai** | Global state for the shorten form and the URL list atom; simple and predictable. |
| 🔄 **TanStack Query** | Used for the shorten mutation (loading/error/success); list is Jotai. |
| 🗃️ **Prisma** | Type-safe DB access and migrations; repository wraps it so business logic stays in services. |
| 🐘 **PostgreSQL** | Persistent storage for short URLs and click counts. |
| 🧪 **Vitest** | Unit tests for short-code generation, URL validation, body parsing, and React components. |
| 🚀 **Turbo** | Monorepo tasks (dev, build, typecheck) from the root. |

---

## 🧪 Tests

Tests use **Vitest** and **React Testing Library**. Run them from **`applications/web`**:

```bash
cd applications/web
pnpm test
```

Watch mode (re-run on file changes): `pnpm test:watch`.

**What’s covered**

- 🔧 **Backend** — `app/server/utils/`: short-code generation and validation, URL validation, shorten request body parsing.
- 🖼️ **Frontend** — ShortenPage (form, empty URL error, successful shorten), Layout, UrlInputField, LoadingButton, PageSection, PageTitle, ContentCard.

All tests are in `app/**/*.test.ts` and `app/**/*.test.tsx`.

---

## 📜 Scripts

From the **project root**:

| Command | Description |
|---------|-------------|
| `pnpm dev` | 🟢 Start the web app (and Turbo dev for the monorepo). |
| `pnpm build` | 📦 Build for production. |
| `pnpm typecheck` | ✅ Run TypeScript checks. |

From **`applications/web`**:

| Command | Description |
|---------|-------------|
| `pnpm test` | 🧪 Run Vitest once. |
| `pnpm test:watch` | 👀 Run Vitest in watch mode. |
| `npx prisma migrate deploy` | 📤 Apply migrations. |
| `npx prisma studio` | 🗄️ Open Prisma Studio. |

---

## 📁 Project layout (high level)

```
url-shortener-candidates-challenge/
├── applications/web/          # React Router app
│   ├── app/
│   │   ├── api/               # Frontend: API client, types, error mapping
│   │   ├── components/        # React components (Layout, Shorten, Urls list, etc.)
│   │   ├── hooks/             # useShortenUrl, useCopyToClipboard
│   │   ├── routes/            # Routes and API handlers (shorten, urls, /s/:code)
│   │   ├── server/            # Backend only: handlers, loaders, services, repository, utils
│   │   ├── state/             # Jotai atoms (form state, URL list)
│   │   ├── theme/             # MUI theme
│   │   ├── types/             # Route meta types (e.g. route.types)
│   │   └── utils/             # date, url validation, route-meta
│   └── prisma/                # Schema and migrations
├── libs/engine/               # Shared utilities (e.g. base URL); used by server
├── docker-compose.yml        # Postgres + web service
├── Dockerfile                 # Production image
└── .env                       # DATABASE_URL, optional PUBLIC_URL
```

Backend flow: **Routes** → **handlers / loaders** → **services** → **repository** → **Prisma/DB**. Frontend uses **components**, **hooks**, **state**, and the **api** client only. See **[applications/web/BACKEND.md](applications/web/BACKEND.md)** and **[applications/web/FRONTEND.md](applications/web/FRONTEND.md)** for full structure and file layout.

---

## 📌 Challenge context

This repo is a refactored solution to a full-stack URL shortener challenge. The original brief and submission template are in the repo:

- 📄 **[CHALLENGE_DESCRIPTION.md](./CHALLENGE_DESCRIPTION.md)** — Original problem and requirements.
- 📝 **[CHALLENGE_SUBMISSION.md](./CHALLENGE_SUBMISSION.md)** — Template for what was done, AI usage, and feedback.

The app is designed to run in Docker; see [Docker (full stack)](#docker-full-stack) above.
