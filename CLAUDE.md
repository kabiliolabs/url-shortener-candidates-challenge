# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Take-home challenge: refactor a deliberately flawed URL shortener. Requirements are in `CHALLENGE_DESCRIPTION.md`; decisions and AI usage are written up in `CHALLENGE_SUBMISSION.md`.

## Domain language

- **Short URL**: the entity that pairs a short code with an original URL and its click count. Publicly `{PUBLIC_URL}/s/{code}`.
- **Short code**: the unique identifier in the path of a short URL.
- **Original URL**: the validated destination a short URL redirects to.
- **Click**: one followed redirect of a short URL.
- Use exactly these names in code and tests, with no synonyms (link, slug, hash, visit). UI copy may use everyday words like "link".

## Commands

```bash
pnpm install && cp .env.example .env
pnpm dev                     # web on http://localhost:5173
pnpm build
pnpm typecheck
pnpm clean                   # clean:deep also removes node_modules
pnpm --filter web <script>   # one package (the other is @url-shortener/engine)
docker compose up --build    # production build on http://localhost:3000
```

## Structure

- `libs/engine` (`@url-shortener/engine`): everything that is not UI. Consumed as TypeScript source (`main` is `src/index.ts`, bundled by Vite through `ssr.noExternal`), so its `dist/` is never read.
- `applications/web`: React Router v7 framework mode with SSR. Routes are registered in `app/routes.ts`; loaders and actions are the only server entry points.
- Environment: one `.env` at the repository root, loaded into `process.env` in development. Docker ignores `.env*`, so runtime configuration goes under `environment` in `docker-compose.yml`.

## How to work

- Always plan first and wait for approval before editing.
- One concern per change.
- Never commit or push.
- Ask before adding a dependency.
- Code, comments and commit messages in English.
- Comments explain why, not what. No tutorial-style labels ("Step 1", "Domain layer:").

## Architecture rules

- `libs/engine` holds three layers: domain, application and infrastructure.
- Domain imports nothing from Prisma, React Router or infrastructure.
- Use cases depend on interfaces (ports), never on concrete implementations.
- Importing the engine has no side effects: no `process.env` reads, no client instances.
- The web app reads the configuration and wires everything in a single composition root file.

## Correctness rules

- Short code uniqueness is enforced by a database UNIQUE constraint plus retry, never check-then-insert.
- Click counting is atomic in the database.
- Unknown short codes return 404.

## Definition of done

`pnpm typecheck` passes, tests pass, and the app runs with `docker compose up --build`. No test runner is configured yet; document the test commands here when one is added.
