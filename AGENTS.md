# Repository Guidelines

## Project Structure & Module Organization

This pnpm/Turbo monorepo contains two workspaces:

- `applications/web/app/`: React Router 7 routes, server loaders/actions, React components, and Tailwind styles. Register routes in `routes.ts`; static assets belong in `applications/web/public/`.
- `libs/engine/src/`: shared URL-shortening logic, exported through `index.ts` as `@url-shortener/engine`. Storage currently uses an in-memory map.

Keep domain logic in the engine and HTTP/UI concerns in web. Read `CHALLENGE_DESCRIPTION.md` for requirements and complete `CHALLENGE_SUBMISSION.md` before submission.

## Build, Test, and Development Commands

Run commands from the repository root using pnpm 10.20.0:

- `pnpm install`: install workspace dependencies.
- `cp .env.example .env`: initialize local configuration; preserve any existing `.env`.
- `pnpm dev`: start development tasks; open `http://localhost:5173`.
- `pnpm build`: build engine and web through Turbo.
- `pnpm typecheck`: check both packages, including React Router type generation.
- `pnpm --filter web start`: serve an existing production build.
- `docker-compose up --build`: build and run Docker at `http://localhost:3000`.

The Docker image uses Node 20. Prefer root README instructions over the generic web template README.

## Coding Style & Naming Conventions

Follow existing TypeScript/TSX style: two-space indentation, double quotes, semicolons, and ES modules. Strict TypeScript is enabled. Use camelCase for functions/variables, PascalCase for React components, and descriptive kebab-case domain filenames such as `shortened-url.ts`. Preserve route filenames such as `_index.tsx` and `s.$code.tsx`. No formatter or linter is configured; match neighboring code.

## Testing Guidelines

No test framework, test suite, test script, or coverage threshold is currently configured. For new automated tests, use colocated `*.test.ts` or `*.test.tsx` files and document the chosen runner and command. Prioritize URL validation, collisions, redirects, and unknown-code handling. Before submitting, run typecheck/build, manually check shortening and redirects, and verify Docker startup. Typechecking does not replace behavioral tests.

## Commit & Pull Request Guidelines

History is brief; the latest commit follows `chore: add clean scripts`. Prefer concise imperative messages with prefixes such as `feat:`, `fix:`, and `chore:`. Keep changes focused and explain significant decisions. PRs should describe behavior, tradeoffs, verification, related issues when applicable, and screenshots for UI changes. Update Docker instructions when needed and document AI usage in `CHALLENGE_SUBMISSION.md`.

## Configuration

Set `PUBLIC_URL` to the externally reachable origin: port 5173 locally or 3000 with Docker. Keep secrets out of Git; document configuration keys in `.env.example`.

## CortexDB — Project Memory

CortexDB provides persistent project context. Scope knowledge to collection `url-shortener-candidates-challenge` and stable IDs beginning `repo:url-shortener-candidates-challenge:` followed by a descriptive topic.

### Before Making Changes

- Use `knowledge_memory_recall` for relevant architecture, data flows, dependencies, and decisions before non-trivial changes. Skip unnecessary lookups for trivial edits.
- Verify recalled facts against current files. Code establishes implemented behavior; user requirements and specifications establish intended behavior.
- Inspect `graph_schema` before querying relationships. Use explicit, source-backed edges for impact analysis; `co_occurs` does not prove a dependency.

### After Making Changes

- Save significant decisions, dependencies, verified root causes, and reusable insights with `knowledge_save`. Search first and read existing records fully with `knowledge_get` before updating their stable IDs. Preserve valid facts and supersede outdated conclusions rather than creating duplicates.
- Include file references, observation date, inspected commit, relevant uncommitted changes, and whether evidence came from static inspection or executed checks.
- Update affected graph entities and relationships when architecture changes; explicitly retire obsolete edges through supported operations.
- Exclude secrets, temporary debugging details, and unverified assumptions.

### Memory Reliability

- Read records and changed relationships back after writing; claim persistence only after successful verification.
- If CortexDB is unavailable, continue independent work using the codebase, disclose the limitation, and leave requested persistence pending.
