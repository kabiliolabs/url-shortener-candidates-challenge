# Submission

## What I Did

I prioritized persistence, architecture, UI, and testing.

- I started by adding tests so I could refactor safely and verify that everything kept working as expected. With that safety net in place, I moved business logic out of the routes and into smaller modules, making the routes thinner and the code easier to scale, test, and maintain.
- I added **PostgreSQL** and **Prisma**, together with a repository layer. I chose SQL over NoSQL mainly because of strong consistency and unique constraints. The repository layer keeps the business logic decoupled from Prisma and the database.
- I used `nanoid` to generate longer unique codes.
- I refactored the frontend using `shadcn` to create a cleaner and more consistent UI. I also improved the UX with a better visual hierarchy, a proper URL input, clearer success and error feedback, and copy-to-clipboard for the shortened URL.
- I added a click analytics feature. The stats include total links, total clicks, the top clicked links, and a full list with each link's code.
- I split the project into small modules so the different responsibilities are as decoupled as possible.

## Architecture Decisions

I moved all domain and application logic into `libs/engine` and left `applications/web` with only route modules, UI components, and thin server adapters under `app/server`.

- All URL data is persisted in PostgreSQL, not in memory. Both creates and lookups go through `prisma.shortenedUrl.`* at runtime.
- `libs/engine/src/domain/` owns entities, types, and domain errors.
- `libs/engine/src/application/` owns repository ports (`repositories/`) and use cases (`use-cases/`).
- `libs/engine/src/infrastructure/` owns Prisma client singleton and repository wiring.
- `libs/engine/prisma/` owns the schema and migrations.
- `applications/web/app/server/http-shorten-url.ts` and `load-stats-data.ts` adapt HTTP concerns such as request and environment handling into engine calls.

### Tradeoffs

- I chose PostgreSQL over SQLite for better concurrent write handling and because it fits the Docker Compose deployment model more naturally.
- The `ShortenedUrl` table tracks clicks with an integer counter instead of individual click event rows. This is simpler and sufficient for the current listing and stats requirements.
- Tests use an in-memory repository implementation (`tests/helpers/in-memory-repository.ts`) instead of a test database. This keeps the test suite fast and avoids external dependencies while still exercising the same repository contract that the Prisma implementation fulfills at runtime.

## What I Would Do With More Time

- Improve the use cases by extracting smaller use cases for better scalability and maintainability.
- Validate that submitted values are real URLs instead of only checking for presence.
- Add rate limiting to prevent abuse.
- Improve how errors are displayed.
- Add richer analytics such as click history or more advanced reporting.
- Add auth to support a personal dashboard and owned links.
- Create a CI pipeline with lint, testing, and migration checks.
- Add observability metrics.

## AI Usage

I used Cursor to implement all the decisions taken, using my own default rules and skills. I reviewed and adjusted the todos created from each plan before building them.

I attached every plan I created in the `.cursor/plans` folder.

## Feedback

The challenge is clear and easy to get running, which makes it good for discussing tradeoffs in architecture and testing.

I think that for someone who is not very familiar with this tech stack, as was my case, 2 hours might be a bit tight. I ended up spending more time because I first needed to become somewhat familiar with it.