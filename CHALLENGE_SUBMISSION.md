# Submission

## What I Did

- Shortening canonicalizes the URL and returns the existing code when that URL was already shortened.
- `GET /s/:code` redirects with 302 and increments clicks atomically. Every GET counts, bots and unfurlers included.
- The list shows the latest 20 links.
- Unknown routes and unknown codes render a styled 404 and keep the 404 status.

Correctness under concurrency came first, then tests, then the UI.

Run it with `docker compose up --build`. Tests: `pnpm test`.

Design and trade-offs: see `docs/spec.md` and `docs/decisions.md`.

## What I Would Do With More Time

Port-contract tests against Postgres, a tidier frontend, creation rate limiting with bot filtering, and pagination for the list.

## AI Usage

The design and the docs were closed in a previous session, before coding. Cursor implemented one bounded step at a time. I reviewed every diff and pushed back where needed: tests first, missing test cases, the UI, and the folder structure.

`AGENTS.md` is the context file Cursor worked from. The detail is in `docs/decisions.md`.

Example prompts:

> Read AGENTS.md, docs/spec.md and docs/decisions.md, then read the repo. Don't write or change any code yet. List: 1. Gaps 2. Contradictions 3. Risks. Keep it short.

> Refactor only, no behavior changes. Reorganize libs/engine/src into folders: domain/: canonicalize-url, generate-code, code-collision (+ their tests next to them); ports/: short-link-repository; use-cases/: shorten-url, resolve-code, list-short-links (+ their tests next to them); testing/: keep in-memory-short-link-repository as is. Update imports and keep index.ts as the single public entry, exporting the same names as today, so applications/web needs no changes. Run pnpm test and pnpm build. Report changed files. Don't commit.

## Feedback

I really enjoyed the challenge: the project was fun and interesting, and the app was pleasant to use. I especially liked that it's open-ended, with several possible improvements to choose from, so I had to decide what to focus on and manage a limited time box. Having a bounded time is great, since take-home tests often run too long. One small note: the fork's pull requests are public, so candidates can see each other's submissions. I chose not to look at them so my work would reflect my own approach, but you may want to keep submissions private.
