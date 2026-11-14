# URL Shortener

## Tech Stack

```
url-shortener/
├── applications/web/    # React + React Router v7
├── libs/engine/         # Domain and application logic
└── libs/database/       # Generic PostgreSQL/Drizzle infrastructure and focused tests
```

| Technology                                    | Description                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [pnpm](https://pnpm.io/)                      | Fast, disk-efficient package manager with built-in monorepo support via workspaces                |
| [Turbo](https://turbo.build/)                 | High-performance build system for monorepos. Runs tasks in parallel and caches results            |
| [React](https://react.dev/)                   | Library for building user interfaces with components                                              |
| [React Router v7](https://reactrouter.com/)   | Full-stack React framework. Handles routing, data loading (loaders), mutations (actions), and SSR |
| [TypeScript](https://www.typescriptlang.org/) | Typed superset of JavaScript for catching errors at compile time                                  |
| [Zod](https://zod.dev/)                       | Runtime validation of application inputs                                                          |
| [Tailwind CSS](https://tailwindcss.com/)      | Utility-first CSS framework for rapid UI development                                              |
| [Vite](https://vite.dev/)                     | Fast build tool and dev server with hot module replacement                                        |

## Local Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open `http://localhost:5173`

## Tests

Run the engine domain/use-case tests, server route integration tests, and UI unit tests from the repository root:

```bash
pnpm test
pnpm typecheck
pnpm build
```

Tests use Vitest and are colocated as `*.test.ts` or `*.test.tsx`. Engine tests run in Node and cover `Result`, URL validation/value equality, the `ShortenedURL` entity, and the shortening/resolution use cases. Use-case tests verify input validation, exact code lookup, and storage effects, restoring the shared map and mocks after each test. Engine test types are checked separately without emitting tests into the library build.

Shortener code and its tests live in `libs/engine/src/modules/url-shortener`. The application layer separates `usecases` (`ShortenURLUseCase` and `ResolveShortenedURLUseCase`) from Zod schemas in `validations`. The `ShortenedURL` aggregate owns the HTTP/HTTPS destination policy and enforces it through guarded creation. Generic URL parsing and its read-only protocol getter live in `libs/engine/src/shared/value-objects/url.ts`; generic results live in `shared/types`. The existing map and generator remain in the module's `shortened-url.ts`. Repository abstraction and persistent storage are deferred.

Web component/controller/view tests use React Testing Library and jsdom. Route integration tests run in Node through React Router's static handler, exercise the real shortening action and redirect loader, and restore the in-memory store after each test. They verify HTTP 400 validation feedback, invalid-code responses, unchanged storage on rejection, trimming, successful links, exact redirects, and unknown-code 404 responses. A controller test checks that returned validation errors render inline.

Run `pnpm --filter @url-shortener/engine test` for domain/use-case tests or `pnpm --filter web test:watch` for web watch mode. Browser checks remain necessary for visual layout and real HTTP redirects.

## Docker Setup

```bash
docker compose up --build web
```

Open `http://localhost:3000`


## Database foundation

PostgreSQL is optional infrastructure. Shortened URLs still use the in-memory Map;
there are no production shortener tables or repository adapters. Web startup,
shortening and redirects do not require PostgreSQL or database environment variables.

Start only PostgreSQL using the root `docker-compose.yaml`:

```bash
docker compose up -d postgres
```

The service uses PostgreSQL 17, a health check and the project-scoped
`postgres_data` named volume. Restarting or running `docker compose down` preserves
its data; `docker compose down --volumes` deletes it. The published database port
binds only to loopback. `.env.example` documents the local development defaults:
`POSTGRES_HOST=127.0.0.1`, `POSTGRES_PORT=5432`, `POSTGRES_DB=url_shortener_dev`,
`POSTGRES_USER=url_shortener`, and `POSTGRES_PASSWORD=local_password`.
These credentials are for local development. Preserve an existing `.env` when setting up.
Changing initialization credentials does not rewrite an already initialized volume.
Host-run commands use the published host/port. A future consumer inside the Compose
network would use host `postgres` and port `5432`; web is not such a consumer yet.

The private `@url-shortener/database` workspace package exposes a concrete `PostgresDatabase` class:

```ts
import { PostgresDatabase } from "@url-shortener/database";
import * as schema from "./schema"; // Owned by the consuming application.

const database = new PostgresDatabase({
  host: "127.0.0.1",
  port: 5432,
  database: "url_shortener_dev",
  user: "url_shortener",
  password: "local_password",
  connectionTimeoutMillis: 5000,
}, schema);

try {
  await database.healthCheck();
  // database.db is a Drizzle client typed from the supplied schema.
} finally {
  await database.close();
}
```

Importing and constructing the client are lazy: neither connects nor migrates.
The constructor validates required settings and reads no environment variables.
The optional connection timeout defaults to 5000 ms and must be finite and positive
(at most 2147483647 ms). Errors reach the caller without automatic retries or process
termination. An idle pool connection error is retained for the next explicit health
check; the failed connection is removed by pg. Call `close()` when finished; it is
asynchronous and safe to call repeatedly.

### Consumer-owned migrations

No application schema exists yet, so the repository intentionally provides no root
`db:generate` or `db:migrate` commands and no committed demo migrations. When a real
consumer adds persistence, its TypeScript schema, Drizzle Kit configuration and SQL
migrations belong to that consumer, outside the generic database package.

For example, a future application can install Drizzle Kit as a development dependency,
create its own `drizzle.config.ts`, and run these commands from its directory:

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts", // The consumer's real tables.
  out: "./migrations",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

```bash
pnpm exec drizzle-kit generate --config drizzle.config.ts
# Review the generated SQL before explicitly applying it.
pnpm exec drizzle-kit migrate --config drizzle.config.ts
```

These are examples for a future consumer, not commands runnable against a current
production schema. Set its connection URL explicitly: host-run commands use
`127.0.0.1` and the published port; containers use `postgres:5432`. Migration failures
must exit nonzero, and repeat application must preserve existing data. No migration
runs on package import, client creation, web startup, or ordinary tests.

### Database integration tests

`pnpm test` includes deterministic database unit tests and needs no Docker.
Run the separate integration suite with a running Docker daemon and Docker Compose v2:

```bash
pnpm test:database
```

The suite starts only PostgreSQL under a unique Compose project, with generated test
credentials, an isolated database/volume and a dynamically allocated host port. It
ignores developer `.env` settings and keeps its test-only schema, Kit configuration
and generated SQL/snapshots in a temporary directory. The package-owned integration
test exercises explicit Drizzle Kit generation/application and checks successful queries, rejected configuration, a stalled-connection
timeout, process exit after cleanup, migration rollback and repeat application, and
record durability across a container restart. It closes connections and removes only
its own containers, network and volume, including on handled interruption. Commands
have bounded timeouts. Missing Docker or failed cleanup exits nonzero, never a passing
skip. The reported scratch directory is outside the repository and may be removed
after inspecting failures. A forced kill cannot run cleanup: use the printed unique
project name with `docker compose -p <project> down --volumes` if recovery is needed.
