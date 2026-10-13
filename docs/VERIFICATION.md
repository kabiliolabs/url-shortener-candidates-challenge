# Verification

## Automated checks

Run these commands from the repository root:

```bash
pnpm exec prisma validate
pnpm test
pnpm typecheck
pnpm build
docker compose config --quiet
```

These checks validate the Prisma schema, domain and application behavior,
TypeScript contracts, production bundling, and Compose configuration.

## Docker smoke test

The smoke test verifies the deployed path rather than only the application
units:

1. Build the Docker image.
2. Start PostgreSQL and wait for its healthcheck.
3. Start the web service and allow `prisma migrate deploy` to finish.
4. Create a valid destination URL.
5. Open the corresponding `/s/{code}` route once.
6. Confirm that the route records a click and returns to `/`.
7. Confirm that the dashboard displays the updated count and click event.

For a host where port `3000` is busy, run the smoke-test web container on a
temporary host port while preserving container port `3000`.

## Recorded result

Verification completed on 2026-10-13:

- `pnpm exec prisma validate` completed successfully.
- `pnpm test` completed successfully: 6 test files and 25 tests passed.
- `pnpm typecheck` completed successfully for `web` and `@url-shortener/engine`.
- `pnpm build` completed successfully for both workspaces.
- `docker compose config --quiet` completed successfully.
- `docker compose build web` completed successfully.
- An isolated web container on host port `3010` completed migrations and served
  the application.
- Creating a smoke-test URL returned HTTP `200`.
- Resolving its short code returned HTTP `302` with `Location: /`.
- PostgreSQL confirmed one persisted click and one persisted click event.

## Current behavior

The `/s/{code}` route resolves the short code, atomically stores one click and
one click event, then redirects to the dashboard (`/`). It does not navigate
the browser to the stored destination URL in the current dashboard workflow.

## Protected challenge artifacts

`CHALLENGE_DESCRIPTION.md` and `CHALLENGE_SUBMISSION.md` are intentionally not
modified. This repository documents the implementation and AI workflow here;
the repository owner can transfer relevant wording to the protected submission
artifact when appropriate.
