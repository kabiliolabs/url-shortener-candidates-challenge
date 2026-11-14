# URL Shortener

## Tech Stack

```
url-shortener/
├── applications/web/    # React + React Router v7
└── libs/engine/         # Domain logic
```

| Technology                                    | Description                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [pnpm](https://pnpm.io/)                      | Fast, disk-efficient package manager with built-in monorepo support via workspaces                |
| [Turbo](https://turbo.build/)                 | High-performance build system for monorepos. Runs tasks in parallel and caches results            |
| [React](https://react.dev/)                   | Library for building user interfaces with components                                              |
| [React Router v7](https://reactrouter.com/)   | Full-stack React framework. Handles routing, data loading (loaders), mutations (actions), and SSR |
| [TypeScript](https://www.typescriptlang.org/) | Typed superset of JavaScript for catching errors at compile time                                  |
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

Run the engine domain tests, server route integration tests, and UI unit tests from the repository root:

```bash
pnpm test
pnpm typecheck
pnpm build
```

Tests use Vitest and are colocated as `*.test.ts` or `*.test.tsx`. Engine tests run in Node and cover `Result`, URL validation/value equality, and the `ShortenedURL` entity. Engine test types are checked separately without emitting tests into the library build.

Web component/controller/view tests use React Testing Library and jsdom. Route integration tests run in Node through React Router's static handler, exercise the real shortening action and redirect loader, and restore the in-memory store after each test. They verify HTTP 400 validation feedback, unchanged storage on rejection, trimming, successful links, and redirects. A controller test checks that returned validation errors render inline.

Run `pnpm --filter @url-shortener/engine test` for domain tests or `pnpm --filter web test:watch` for web watch mode. Browser checks remain necessary for visual layout and real HTTP redirects.

## Docker Setup

```bash
docker-compose up --build
```

Open `http://localhost:3000`
