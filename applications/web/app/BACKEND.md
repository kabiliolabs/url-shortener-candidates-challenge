# Backend structure

The server-side code follows a layered structure: routes → services → repositories → DB. Config and domain types/errors are shared so the backend stays legible, flexible, and robust.

## Layers (top → bottom)

```
Routes (HTTP)  →  Services (business logic)  →  Repositories (data access)  →  DB (Prisma)
                     ↑                                    ↑
                Config (code gen, limits)          Prisma error helpers (lib)
                     ↑
                Domain (types, errors, limits)
```

### 1. Routes (`app/routes/`)

- Handle HTTP: request/response, form data, redirects.
- Call **services** only. No direct Prisma or repository imports.
- Map **domain errors** to user-facing messages or HTTP status (e.g. ValidationError → 400-style message).
- Return data or throw `Response` for errors (e.g. 404).

### 2. Services (`app/services/*.server.ts`)

- **Business logic**: validation (URL format, length, short code format), code generation, retries.
- Use **config** for code length, alphabet, and retry count (env-overridable).
- Throw **domain errors** (ValidationError, ConflictError, NotFoundError); routes map them to HTTP.
- Call **repositories** for all DB access. No direct `db` usage.
- Validate short code format before DB in resolve/get/update (avoids unnecessary lookups and keeps rules in one place).

### 3. Repositories (`app/repositories/*.repository.server.ts`)

- **Data access only**: create, find, update via Prisma. No business rules.
- Use **lib/prisma-errors** for Prisma error codes (P2002, P2025) so the rest of the app doesn’t depend on raw codes.
- Single place that talks to **DB**.

### 4. DB (`app/db.server.ts`)

- Prisma client singleton. Used only by repositories.

## Domain (`app/domain/`)

- **Types**: ShortenedUrl, CreateShortenedUrlInput, UpdateShortenedUrlInput (shared by repo, service, routes).
- **Errors**: ValidationError, NotFoundError, ConflictError (and type guards: isDomainError, isValidationError, …) so routes can map to HTTP without depending on Prisma or service internals.
- **Limits**: e.g. URL_MAX_LENGTH (used by service validation).

## Config (`app/config/*.server.ts`)

- **Code generation**: SHORT_CODE_ALPHABET, SHORT_CODE_LENGTH, MAX_CREATE_ATTEMPTS, UNBIASED_BYTE_MAX.
- Optional env: SHORT_CODE_LENGTH, MAX_CREATE_ATTEMPTS (with safe defaults) for flexibility without code changes.

## Lib (`app/lib/*.server.ts`)

- **Prisma errors**: isUniqueViolation(e), isNotFound(e), PRISMA_UNIQUE_VIOLATION, PRISMA_NOT_FOUND. Used by repository and service so error handling is consistent and legible.

## Shortened URL flow

| Action        | Route      | Service                     | Repository                    |
|---------------|------------|-----------------------------|-------------------------------|
| Shorten URL   | `_index`   | shortenUrl(url)             | create({ code, url })         |
| Redirect      | `s.$code`  | resolveAndTrackClick(code)  | getUrlAndIncrementClicks(code)|
| Get/Update/List | (future)  | getById, updateByCode, list | findById, updateByCode, findAll |

## File layout

```
app/
├── domain/
│   ├── shortened-url.ts    # Types + LIMITS
│   └── errors.ts           # DomainError, ValidationError, NotFoundError, ConflictError + guards
├── config/
│   └── code-generation.server.ts
├── lib/
│   └── prisma-errors.server.ts
├── db.server.ts
├── repositories/
│   └── shortened-url.repository.server.ts
├── services/
│   └── shortened-url.server.ts
└── routes/
    └── ...
```

## Robustness

- **Validation**: URL required, http/https only, max length; short code format (length + allowed chars) checked before DB.
- **Errors**: Typed domain errors and Prisma helpers so retries and HTTP mapping are explicit.
- **Config**: Code length and retries can be tuned via env without changing service logic.
