# 🖼️ Frontend structure

All client-side UI and client-safe code lives in **`app/`** except **`app/server/`**. The frontend talks to the backend only via the **API client** (fetch to `/api/shorten`, `/api/urls`) and via **route loaders** (e.g. redirect for `/s/:code`). No `server/*` imports in frontend code so it stays bundleable by Vite for the browser.

## 📐 Layers (top → bottom)

```
root.tsx (providers)  →  routes  →  page components  →  hooks, state, api
       ↓                    ↓              ↓
  Theme, Layout      meta, loader     shared components (Layout, ContentCard, etc.)
```

### 1. 🏠 Root & layout (`app/root.tsx`)

- **Root**: Wraps the app in `QueryClientProvider` (TanStack Query), `JotaiProvider` (Jotai), and `AppTheme` (MUI). Renders `<Outlet />` inside `Layout`. Exports `links` for fonts and `Layout` for the HTML shell; exports `ErrorBoundary` for route errors.
- **Layout** (`app/components/Layout/`): App bar with “URL Shortener” link and tabs (Home, All URLs). Renders `children` (the current route). Used on every page.

### 2. 🛣️ Routes (`app/routes/`)

- **Route files** define which component is shown for each URL and optional `meta` (title, description) and `loader`/`action` (server).
- **`_index.tsx`**: Home — renders `ShortenPage` (shorten form and result).
- **`urls._index.tsx`**: All URLs — renders `UrlsPage` (table of short links and click counts).
- **`api.shorten.ts`**, **`api.urls.ts`**: API route modules; they call **server handlers** only (see [BACKEND.md](./BACKEND.md)). No UI.
- **`s.$code.tsx`**: Short link — uses a **server loader** to redirect; no frontend component.

Routes import **components** and **utils** (e.g. `route-meta`). They do not import `server/*`.

### 3. 🧩 Components (`app/components/`)

- **Layout**: App bar and tabs; wraps all pages.
- **ShortenPage**: Home page — form (ShortenFormUrlInput, ShortenFormSubmitButton), shortened URL result with copy. Uses `useShortenUrl`, `useCopyToClipboard`, and Jotai atoms for form state.
- **UrlsPage**: All URLs page — loads list via `loadUrlList` (sets `urlListAtom`), renders table (short code, original URL, clicks, created). Clicking a short code updates the atom (increment clicks) and opens the link.
- **ShortenFormUrlInput** / **ShortenFormSubmitButton**: Form pieces; read/write Jotai (shorten form atoms) and hooks.
- **UrlInputField**: Reusable text field (URL label, optional helper text, error state).
- **LoadingButton**: Button with loading state (used by submit button).
- **ContentCard**, **PageSection**, **PageTitle**: Layout primitives for the shorten page.

Each feature folder has an `index.ts` that re-exports the component (and sometimes types).

### 4. ⚛️ State (`app/state/`)

- **Jotai atoms** — single source of truth for UI and list data:
  - **shortenForm.ts**: `shortenFormUrlAtom`, `shortenFormLoadingAtom`, `shortenFormErrorAtom`, `shortenFormCopyErrorAtom`, `lastShortenedUrlAtom` (form input, loading, errors, last result).
  - **urlList.ts**: `urlListAtom` (list of `UrlListRow`), `loadUrlList(setList)` (fetches `/api/urls` and updates the atom). Type **UrlListRow** (id, shortCode, originalUrl, clicks, createdAt) is used across the app for the table.

Components and hooks read/update these atoms; no direct `server/*` or backend imports in state.

### 5. 🪝 Hooks (`app/hooks/`)

- **useShortenUrl**: Form state (url, setUrl), submit handler, loading/error, shortened URL result. Uses TanStack Query mutation for POST `/api/shorten`, Jotai for form atoms, and `loadUrlList` after success to refresh the list.
- **useCopyToClipboard**: Copy text to clipboard; returns `copy`, `copied`, and optional error. Used by ShortenPage for the shortened URL.

Hooks use **api/client**, **state**, **utils** (e.g. url validation). They do not import `server/*`.

### 6. 🌐 API client (`app/api/`)

- **client.ts**: `request<T>()` helper, `shortenUrl(url)`, `listUrls()`. Uses `isApiErrorResponse()` for error bodies; throws `ApiError` with optional `status`.
- **types.ts**: `ShortenedUrlDto`, `ShortenResponse`, `ListUrlsResponse`, `ApiError`, `ApiErrorResponse`, `isApiErrorResponse()`.
- **error-messages.ts**: Maps raw API/server messages to user-facing strings (shorten errors, list errors, copy errors). Used by hooks and components.

All backend communication from the UI goes through this layer (same-origin `/api/*`).

### 7. 🎨 Theme (`app/theme/`)

- **index.tsx**: MUI `createTheme` (dark palette, primary/secondary, typography, component overrides) and `AppTheme` provider. Ensures consistent look and accessibility.

### 8. 🔧 Utils & types

- **utils/**: **date.ts** (formatDate for table), **url.ts** (normalizeUrl, validateUrl for the form), **route-meta.ts** (createRouteMeta for route `meta()`).
- **types/**: **route.types.ts** (RouteMetaDescriptor, RouteMetaReturn) used by route-meta and route files.

---

## 📁 File layout

```
app/
├── root.tsx                 # App shell, providers, ErrorBoundary
├── app.css                  # Tailwind theme (vars), global styles
├── query-client.ts          # TanStack Query client instance
├── routes.ts                # Route config (index, urls, api, s/:code)
├── api/
│   ├── client.ts            # fetch wrapper, shortenUrl, listUrls
│   ├── types.ts             # DTOs, ApiError, isApiErrorResponse
│   └── error-messages.ts    # Map API/server errors to user messages
├── components/
│   ├── Layout/              # App bar, tabs
│   ├── ShortenPage/         # Home page (form + result)
│   ├── UrlsPage/            # All URLs table
│   ├── ShortenFormUrlInput/
│   ├── ShortenFormSubmitButton/
│   ├── UrlInputField/
│   ├── LoadingButton/
│   ├── ContentCard/
│   ├── PageSection/
│   └── PageTitle/
├── hooks/
│   ├── index.ts
│   ├── types.ts
│   ├── useShortenUrl.ts
│   └── useCopyToClipboard.ts
├── state/
│   ├── index.ts
│   ├── shortenForm.ts       # Form atoms
│   └── urlList.ts           # urlListAtom, loadUrlList, UrlListRow
├── theme/
│   └── index.tsx            # MUI theme, AppTheme
├── types/
│   └── route.types.ts
├── utils/
│   ├── date.ts
│   ├── url.ts
│   └── route-meta.ts
├── routes/                  # Route modules (see above)
└── server/                  # Backend only — see BACKEND.md
```

---

## 🔄 How it works

- **Shorten flow**: User submits form → `useShortenUrl` validates (utils/url), calls `shortenUrl()` (api/client) → backend returns short link → success updates `lastShortenedUrlAtom` and calls `loadUrlList(setUrlList)` so the list atom is refreshed. Errors are mapped with error-messages and shown in the form.
- **URL list flow**: UrlsPage mounts → `loadUrlList(setUrls)` runs → `listUrls()` (api/client) fetches `/api/urls` → response is mapped to `UrlListRow[]` and written to `urlListAtom`. Table renders from the atom. Clicking a short code in the table updates the atom (increment clicks) and opens the link.
- **Short link (redirect)**: User opens `/s/:code` → route uses a **server loader** (see BACKEND.md) to look up the URL, increment click count, and redirect. No frontend component; the browser is redirected to the long URL.

---

## ⚖️ Frontend vs backend

- 🖼️ **Frontend** = everything in `app/` that is **not** under `app/server/`. It can import **api**, **components**, **hooks**, **state**, **theme**, **utils**, **types**, and **routes**. It must **not** import `server/*` so Vite can build a client bundle and avoid pulling server-only code into the browser.
- 🖥️ **Backend** = `app/server/` only. See **[BACKEND.md](./BACKEND.md)** for handlers, loaders, services, repository, and how routes call into the server.
