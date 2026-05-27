# Web Application

A React Router v7 full-stack application for the URL shortener.

This package is part of the Docker-managed workspace. Do not install or run dependencies directly from this folder.

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Development

Run the application from the repository root:

```bash
cp .env.example .env
docker compose up --build
```

The application will be available at `http://localhost:5173`.

## Package Commands

Run package commands through Docker:

```bash
docker compose run --rm web pnpm --filter web typecheck
docker compose run --rm web pnpm --filter web build
```

## Build Output

React Router writes the production build to `applications/web/build`:

```txt
build/
  client/    # Static assets
  server/    # Server-side code
```

## Deployment

The repository root `Dockerfile` contains the production image target. See the root [README.md](../../README.md) for Docker commands.

## Styling

This package uses Tailwind CSS. Keep shared UI styles and components in the web application, and keep domain logic in `libs/engine`.
