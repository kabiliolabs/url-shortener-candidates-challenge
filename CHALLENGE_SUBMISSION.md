# Submission

## What I Did

I focused on transforming the MVP into a production-ready application by addressing architectural flaws and improving the user experience:

- **Clean Architecture & Decoupling:** The original codebase tightly coupled business logic within the React Router actions. I separated the domain logic into a standalone `libs/engine` package using Clean Architecture patterns (Entities, Value Objects, Use Cases, Repositories).
- **Database Persistence:** The original app used a volatile in-memory Map which meant data was lost on restarts and clicks weren't safe from race conditions. I introduced a PostgreSQL database via Prisma, using atomic updates for click increments.
- **Premium Frontend:** The initial UI was intentionally basic. I built a visually engaging, responsive interface using Tailwind CSS v4 and shadcn-ui. It now features proper loading states, error boundaries, glassmorphism, and pagination for recent links.
- **Robust Infrastructure:** Reconfigured `docker-compose.yml` and added a local `docker-compose.dev.yml` to ensure seamless database connections across both development and production environments.

## What I Would Do With More Time

- **URL Liveliness Validation:** Add a backend check during URL creation to verify that the provided URL actually returns a `200 OK` status, preventing users from shortening dead links.
- **Rate Limiting:** Protect the URL creation endpoint from abuse by adding rate limiting per IP or user session.
- **Alternative Lightweight ORM:** While Prisma is powerful, adopting a lighter query builder like Kysely or Drizzle could improve serverless startup times and reduce bundle size.
- **Advanced Metrics:** Track more detailed analytics (e.g., referrers, geographic locations, or time-series data) rather than just a simple click counter.

## AI Usage

I utilized Gemini for spec-driven development and generating initial boilerplate. It was particularly helpful for scaffolding the React components, structuring the Tailwind UI layout rapidly, and drafting the initial Clean Architecture separation. It accelerated routine tasks while I guided the overall architectural decisions.

## Feedback

This was a highly engaging challenge! It provided an excellent, realistic baseline that tested both system design (refactoring toward a decoupled monorepo) and product sensibility (upgrading the UX and ensuring robust data handling).
