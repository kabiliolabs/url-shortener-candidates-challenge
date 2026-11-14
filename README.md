# URL Shortener

## Tech Stack

```
url-shortener/
├── applications/web/    # React + React Router v7
└── libs/engine/         # Domain and application logic
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
docker-compose up --build
```

Open `http://localhost:3000`
