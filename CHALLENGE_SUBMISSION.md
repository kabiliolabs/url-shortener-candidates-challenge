# Submission

## What I Did

### Problems found in the initial codebase

- **Code generator:** alphabet `"abc"` and length 2 give only 9 possible codes. It never checks for collisions (a new URL can overwrite an existing one) and uses `Math.random()`, which is predictable.
- **Storage:** a globally exported, mutable `Map`. Data is lost on restart and anything can write to it.
- **No domain model:** a URL is a bare string in a `Map`, with no click count or timestamps.
- **Config:** `PUBLIC_URL` is read at import time with no validation. If it's missing, the action returns `"undefined/s/xx"`.
- **No validation:** the action only checks that the field is non-empty. The redirect route sends users to whatever string was stored, including `javascript:` and `data:` URLs.
- **Separation of concerns:** routes talk directly to the storage `Map`, with no service or repository layer.
- **Missing:** click statistics, a list view, loading states, error handling, tests, and persistence.
- **UI:** intentionally chaotic, with no reusable components.

---

### Work done
- **Domain layer:** `UrlRepository` and `ShortCodeGenerator` interfaces, so storage and code generation can be swapped without touching business logic. The 9-code `Math.random` generator became a secure base62 generator (7 chars, ~3.5 trillion codes).
- **Service and validation:** `UrlShortenerService` (shorten, resolve, list) depends only on those interfaces. Zod and `URL` validation allow only http(s) and limit length, which blocks `javascript:` and `data:` URLs. Code collisions are handled by retrying on a unique-constraint error rather than check-then-insert, which isn't safe under concurrency.
- **Persistence:** Prisma 7 with SQLite behind the repository interface, with an atomic click increment. Prisma is pinned to v7 rather than `latest`, which currently points to a pre-release.
- **Tests:** Vitest unit tests for the service using an in-memory repository and a deterministic generator (collisions, invalid input, click counting).
- **Web wiring:** routes depend only on the service through a server-only composition root (`container.server.ts`), so the UI layer knows nothing about Prisma. Domain errors map to meaningful 400 messages, unknown codes return 404, and unexpected errors are logged and shown as a generic 500. The old global `Map` and unchecked redirect are gone: only validated http(s) URLs are ever stored and redirected to.
- **Tooling:** pinned `better-sqlite3` to 12.11.1 with a pnpm override. Version 13.x had no prebuilt Windows binary and forced a native compile, which broke installs.
- **Docker:** multi-stage image on node:22-slim that generates the Prisma client at build time, applies migrations on start, and keeps the SQLite file in a named volume so data survives container restarts. A `.dockerignore` stops host `node_modules` (Windows binaries) from overwriting the image's.

## What I Would Do With More Time

- Add an integration test that runs the same cases against `PrismaUrlRepository`, to prove it behaves like the in-memory one.
- Slim down the Docker image (prune dev dependencies with `pnpm deploy`) and run as a non-root user.

## AI Usage

I used Claude as a pair-programming assistant throughout: planning the order of work, generating the domain layer, service and tests, and debugging errors I pasted in (failing tests, editor type errors, environment setup). I reviewed and ran everything locally before committing, and checked current Prisma documentation instead of relying on the model's memory, since Prisma 7 changed its setup significantly.

Example prompts:
- "This is the challenge description, help me plan what to prioritize in ~2 hours."
- "Here is the engine folder and the route files, what flaws do you see?"
- "This test fails, here is the output" (led to a fix for a timestamp tie in the sort order, plus a Vitest config so it ignores compiled `dist/` files).

When the app returned a generic error after wiring, I pasted the terminal output into the chat. The first diagnosis (pin the web app's dependency) was only partly right; the real cause was a second copy of the native dependency pulled in by the Prisma adapter. Reading the install logs together led to a workspace-wide override.

## Feedback

<!-- Any feedback on the challenge? Was it clear? Too easy/hard? Suggestions? -->
