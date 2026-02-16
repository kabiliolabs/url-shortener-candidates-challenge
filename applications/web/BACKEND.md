# 🏗️ Backend structure

All server-only code lives under **`app/server/`**. Routes in `app/routes/` call into `server/handlers` and `server/loaders` only. This keeps the backend clearly separated from the frontend (components, hooks, api client, state) within the same app.

## 📐 Layers (top → bottom)

```
Routes (HTTP)  →  server/handlers, server/loaders  →  server/services  →  server/repository  →  server/db
                                       ↑                      ↑                    ↑
                              server/utils (HTTP, DTOs)   server/errors,    server/utils
                                                          server/constants   (prisma-error, etc.)
```

### 1. 🛣️ Routes (`app/routes/`)

- Handle HTTP: request/response, form data, redirects.
- Import only from **`../server/handlers/`** or **`../server/loaders/`**. No direct service/repository/db imports in route files.

### 2. ⚙️ Handlers & loaders (`app/server/handlers/`, `app/server/loaders/`)

- **Handlers**: Entry points for API routes (e.g. `handleShortenAction`, `handleUrlsLoader`). Parse request, call services, return JSON `Response`.
- **Loaders**: Reusable loader logic for route loaders (e.g. `loadShortCodeRedirect` for `/s/:code`). Call services, return redirect or throw `Response`.

### 3. 🔧 Services (`app/server/services/`)

- Business logic: validation, code generation, retries. Call **repository** and **server/utils** only. No direct `db` usage.
- Throw **server/errors** (ValidationError, ConflictError); handlers map them to HTTP status.

### 4. 🗃️ Repository (`app/server/repository/`)

- Data access only: create, find, update via Prisma. No business rules. Single place that uses **server/db**.

### 5. 🐘 DB (`app/server/db.ts`)

- Prisma client singleton. Used only by repository.

### 6. 📦 Shared backend (`app/server/` root and `server/utils/`)

- 💬 **errors.ts**: ValidationError, ConflictError, isClientError().
- 📋 **constants.ts**: URL_MAX_LENGTH, SHORT_CODE_*, PRISMA_*, SERVER_MESSAGES, RATE_LIMIT_* (for shorten endpoint).
- 📘 **types.ts**: ShortenedUrlEntity, UpdateShortenedUrlInput, ShortenUrlResult (backend-only; do not import in frontend).
- 🔧 **utils/**: http-response, parse-shorten-body, prisma-error, short-code, url-validation, get-base-url, url-list-dto, database-error, rate-limit (in-memory limit for POST /api/shorten to reduce abuse).

## 📁 File layout

```
app/
├── server/
│   ├── db.ts
│   ├── errors.ts
│   ├── constants.ts
│   ├── types.ts
│   ├── handlers/
│   │   ├── shorten-action.server.ts
│   │   └── urls-loader.server.ts
│   ├── loaders/
│   │   └── short-code.server.ts
│   ├── services/
│   │   └── shortened-url.server.ts
│   ├── repository/
│   │   ├── index.ts
│   │   └── shortened-url.repository.ts
│   └── utils/
│       ├── http-response.server.ts
│       ├── parse-shorten-body.server.ts
│       ├── prisma-error.server.ts
│       ├── short-code.server.ts
│       ├── url-validation.server.ts
│       ├── get-base-url.server.ts
│       ├── url-list-dto.server.ts
│       ├── database-error.server.ts
│       └── rate-limit.server.ts
├── api/                    # Frontend: client, types, error-messages
├── routes/
├── components/
└── ...
```

## ⚖️ Frontend vs backend

- 🖥️ **Backend** = everything under `app/server/`. Do not import `server/*` in client bundles (use `.server.ts` where needed; React Router / Vite tree-shake server-only code).
- 🖼️ **Frontend** = `app/api/` (client, types for API contract), `app/components/`, `app/hooks/`, `app/state/`, `app/utils/` (date, url, route-meta), `app/theme/`. These may call the backend only via route loaders/actions or the `api` client (fetch to same-origin API routes).
