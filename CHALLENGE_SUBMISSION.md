# Submission

## What I Did

I refactored the original implementation into a functional URL shortener with persistence, click tracking, and a modern UI.

Main improvements:

- Replaced in-memory storage with PostgreSQL using Prisma ORM, ensuring data survives server restarts.
- Implemented unique short code generation based on database IDs encoded in Base62, removing collision issues.
- Implemented redirection and click tracking for shortened URLs.
- Added input validation and improved error handling for better UX.
- Introduced basic rate limiting to prevent abuse of the URL creation endpoint.
- Reworked the UI using shadcn/ui components, making it clean, responsive, and consistent.
- Added search filtering and link deletion with confirmation dialog.
- Implemented light/dark mode with subtle gradients and mobile-friendly layout.
- Improved separation of concerns by introducing a repository layer between routes and database logic.
- Added unit tests for Base62 encoding and rate limiting logic.
- Added Docker setup so the application and database can run consistently in containers.

## What I Would Do With More Time

- Add server-side pagination and filtering for scalability.
- Add more automated tests (integration).

## AI Usage

- Structuring and prioritizing improvements within the time limit.
- Troubleshooting configuration issues with Prisma and Docker.
- Getting UI component ideas and refactoring suggestions.

## Feedback

The challenge is well-designed. It evaluates practical engineering skills rather than algorithmic exercises.
The instructions were clear, and the provided template made it easy to get started.
Enjoyable challenge.
