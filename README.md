# URL Shortener - Full-Stack Challenge

A technical challenge to evaluate full-stack development skills through refactoring a deliberately flawed URL shortening service.

> **AI tools are permitted and encouraged.** Document how you use them as part of your evaluation.

## The Problem

Our intern built a URL shortener with no knowledge of UI/UX, SOLID principles, DDD, or clean architecture. The result:

- Intentionally ugly UI
- Collision-prone code generator (only 9 possible codes)
- No separation of concerns
- In-memory storage only
- No error handling or input validation
- No click statistics

## Your Task

Refactor and improve the codebase. The service should:

- Shorten URLs and generate unique short codes
- Redirect short codes to original URLs
- Track click statistics

### Guidelines

- **Time limit: ~2 hours.** It doesn't need to be perfect.
- **Prioritize.** You won't finish everything. Pick what matters most to you and do it well.
- **Show off.** Focus on the areas where you're strongest.
- **Explain your decisions.** We want to understand what you did and why. Leave comments if necessary, and create meaningful commit messages that explain your reasoning.
- **Fill in [SUBMISSION.md](./SUBMISSION.md)** before submitting. Document what you did, your AI usage, and any feedback.

### Requirements

**Frontend**

- Clean, modern UI with consistent styling
- Reusable components (consider Radix or shadcn)
- URL input form with proper error feedback
- Display shortened URLs conveniently
- View for listing URLs with statistics

**Server Communication**

- Robust error handling with meaningful messages
- Loading states during requests

**Persistence**

- Database implementation (SQL or NoSQL)
- Data survives server restarts
- Repository pattern or similar abstraction
- We encourage using [Prisma](https://www.prisma.io/) as the ORM

**Security**

- Implement measures to prevent abuse

**Code Quality**

- SOLID principles
- Input validation
- Clean, maintainable code

## Tech Stack

```
url-shortener/
├── applications/web/    # React + React Router v7
└── libs/engine/         # Domain logic
```

| Technology | Description |
|------------|-------------|
| [pnpm](https://pnpm.io/) | Fast, disk-efficient package manager with built-in monorepo support via workspaces |
| [Turbo](https://turbo.build/) | High-performance build system for monorepos. Runs tasks in parallel and caches results |
| [React](https://react.dev/) | Library for building user interfaces with components |
| [React Router v7](https://reactrouter.com/) | Full-stack React framework. Handles routing, data loading (loaders), mutations (actions), and SSR |
| [TypeScript](https://www.typescriptlang.org/) | Typed superset of JavaScript for catching errors at compile time |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework for rapid UI development |
| [Vite](https://vite.dev/) | Fast build tool and dev server with hot module replacement |

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open `http://localhost:5173`
