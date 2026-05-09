# URL Shortener

## Tech Stack

```
url-shortener/
├── applications/web/    # React + React Router v7
└── libs/engine/         # Domain logic
```

| Technology                                    | Version   | Description                                                                                       |
| --------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------- |
| [Node.js](https://nodejs.org/)                | 22        | JavaScript runtime for server-side execution                                                      |
| [pnpm](https://pnpm.io/)                      | 10.20.0   | Fast, disk-efficient package manager with built-in monorepo support via workspaces                |
| [Turborepo](https://turbo.build/)             | ^2.7.4    | High-performance build system for monorepos. Runs tasks in parallel and caches results            |
| [React](https://react.dev/)                   | ^19.2.3   | Library for building user interfaces with components                                              |
| [React Router v7](https://reactrouter.com/)   | 7.15.0    | Full-stack React framework. Handles routing, data loading (loaders), mutations (actions), and SSR |
| [TypeScript](https://www.typescriptlang.org/) | ^5.9.2    | Typed superset of JavaScript for catching errors at compile time                                  |
| [Tailwind CSS](https://tailwindcss.com/)      | ^4.3.0    | Utility-first CSS framework for rapid UI development                                              |
| [Vite](https://vite.dev/)                     | ^7.3.3    | Fast build tool and dev server with hot module replacement                                        |

## Local Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open `http://localhost:5173`

## Docker Setup

```bash
docker-compose up --build
```

Open `http://localhost:3000`
