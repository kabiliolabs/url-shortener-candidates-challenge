# Submission

## What I Did

Refactored the codebase with a focus on architecture and correctness over new features:

- **Layered architecture:** separated concerns into repository (DB), service (business logic), cache, and utils within `libs/engine`; web routes act as thin controllers calling the engine
- **Persistence layer:** replaced the in-memory `Map` with PostgreSQL via Prisma 7
- **Short code generation:** autoincrement ID → Base62 encoding inside a transaction (insert → get ID → update code)
- **UI:** shadcn/ui components with the original aesthetic preserved; routes kept thin
- **URL list with statistics:** home page lists all shortened URLs with their click counts and a scroll for overflow
- **Click tracking:** incremented on every redirect, both cache hits and misses (fire-and-forget to avoid latency)
- **Redis cache:** redirects served from cache (1h TTL) to avoid hitting PostgreSQL on every request
- **Rate limiting:** per-IP rate limiting on the URL creation route using Redis
- **Error handling:** loading states via `useNavigation`, server errors displayed in the form
- **Docker:** fixed SSR package resolution using `public-hoist-pattern` in `.npmrc` so engine packages (`@prisma/client`, `pg`, `redis`) are accessible at runtime

```
libs/engine/src/
├── repository/   # DB access via Prisma
├── services/     # business logic
├── cache/        # Redis singleton + rate limiting
└── utils/        # Base62 encoding

applications/web/app/
├── routes/       # thin controllers (loaders + actions)
└── components/   # UI components (shadcn)
```

## What I Would Do With More Time

- **Client-side validation:** add react-hook-form with a shared Zod schema. Attempted this but hit a compatibility issue: `@hookform/resolvers` v3 uses `r.errors` internally which was removed in Zod v4 (only `r.issues` exists), causing `handleSubmit` to silently skip the submit callback and fall back to native GET form submission.
- **Server-side Zod validation with proper HTTP status codes:** validate the URL on the server using the shared schema and return 400/429/500 with structured error responses instead of untyped plain objects.
- **404 error page:** styled error boundary for unknown short codes (`/s/:code` returning not found).
- **Distributed ID generation (Snowflake):** current Base62 code requires a 2-step DB transaction (insert → get ID → update). A distributed ID generator would eliminate the round-trip.
- **Click tracking at scale:** fire-and-forget risks losing counts on crash. Better: buffer in Redis (`INCR`) and batch-flush to Postgres, or use a message queue (SQS/Kafka) to decouple tracking from the request path.

## AI Usage

Used Claude Code (CLI) and Claude Desktop throughout the entire process — from defining the plan and understanding the problem, to implementing, correcting, and validating the solution.

Example prompts: *"help me design the commit sequence for this refactor"*, *"what's the right way to handle fire-and-forget click tracking with Redis?"*, *"review these tests — do they cover the new behavior?"*, *"why does NODE_PATH not work for ESM modules?"*

## Feedback

Well-scoped and fun. The original codebase had just enough intentional gaps to make it interesting without being frustrating.

## Timeline

Total: ~4h (target was 2h)

| Segment | Duration | Focus | Key commits |
|---|---|---|---|
| 16:50 – 17:45 | 55 min | Understanding the problem, defining the plan | — |
| 19:05 – 20:05 | 60 min | Core implementation (persistence, routes, UI, tests) | `d767056` `7d2606c` `25a781c` `288d0cb` `ac3a773` |
| 20:05 – 21:05 | 60 min | Redis cache, rate limiting, click tracking | `eb445ba` `6caa26b` |
| 21:05 – 23:00 | ~115 min | URL list, Docker SSR fix, submission | `ef2046b` `1de09e9` |
