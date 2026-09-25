# Proposal

## Why

The current implementation is a 14-line stub: short codes are drawn from a 3-character alphabet at length 2 (9 possible codes, no collision detection), all data lives in a single in-process `Map` that is wiped on every restart, no URL validation or click tracking exists, and there is no repository abstraction or UI for reviewing shortened links. This violates the challenge's explicit requirements (persistent storage with a repository pattern, click statistics, input validation, abuse prevention, SOLID structure) and needs to be addressed now, within the ~2 hour take-home time box, before the submission can be considered complete.

## What Changes

- Replace in-memory storage with SQLite via Prisma; data survives process restarts and container recreation (Docker named volume).
- Restructure `libs/engine` into `domain/` (entity, repository interface, validator, code-generation policy, error types), `application/` (`ShortUrlService`), and `infrastructure/` (`PrismaShortUrlRepository`) layers, replacing the current flat two-file stub. **BREAKING**: the library's public exports change from a raw `Map` + free function to a service-oriented API; no other consumers exist besides `applications/web`, which is updated in the same change.
- Introduce collision-safe short-code generation (base62, 7 characters, in-app retry) backed by a database-level `UNIQUE` constraint on `code` as the correctness guarantee.
- Add HTTP/HTTPS-only URL validation with a length limit, returning field-level errors instead of the current single generic message.
- Add click statistics at the row level (`clickCount`, `lastClickedAt`) recorded on every redirect.
- Add a URL listing view showing each shortened URL with its statistics.
- Rework the two existing React Router routes (`/` and `/s/:code`) to call the new `ShortUrlService` instead of touching storage directly; add loading state (`useNavigation()`) and reusable Tailwind components (`Button`, `Input`, `Alert`, `Card`, `Spinner`).
- Add basic per-IP in-memory rate limiting on URL creation.
- Add Vitest coverage for the highest-value logic (code generation retry, validator, repository round-trip, and the two routes) plus a `test` task in `turbo.json`.
- Update Docker (named volume + Prisma migration step), `.env.example`, and `README.md`'s Docker Setup section to match; fill in `CHALLENGE_SUBMISSION.md`.

## Capabilities

### New Capabilities
- `url-shortening`: accepting a destination URL, validating it, generating a collision-safe unique short code, persisting the mapping, enforcing per-IP rate limiting, and surfacing creation success/failure (including loading and field-level error states) to the user.
- `url-redirection`: resolving a short code to its destination URL, redirecting the browser, recording click statistics (count + last-clicked time), and returning a 404 for unknown codes.
- `url-listing`: displaying all previously shortened URLs together with their click statistics and creation date.

### Modified Capabilities
None — this is a greenfield project with no existing `openspec/specs/` entries.

## Impact

- `libs/engine`: full restructure (domain/application/infrastructure layers), new dependencies (`prisma`, `@prisma/client`), new `prisma/schema.prisma`, removal of the current `shortened-url.ts`/`base-url.ts` stub API.
- `applications/web`: `app/routes/_index.tsx` and `app/routes/s.$code.tsx` rewritten to call `ShortUrlService`; new `app/components/` (Button, Input, Alert, Card, Spinner, list item); new `app/lib/rate-limit.server.ts`.
- Root `Dockerfile` / `docker-compose.yml`: named volume for the SQLite file, Prisma migration step in the production stage.
- Root `turbo.json`: new `test` task.
- `.env.example`, `README.md` (Docker Setup section), `CHALLENGE_SUBMISSION.md`: updated/filled in.
- No changes to `pnpm-workspace.yaml`, `tsconfig.base.json`, or the choice of React/React Router v7/Vite/Tailwind/TypeScript/pnpm/Turbo.
