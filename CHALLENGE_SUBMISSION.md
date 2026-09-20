# Submission

## What I Did

<!-- Briefly describe what you implemented or improved. What did you prioritize and why? -->

I refactored the codebase to satisfy the project specifications and built a URL-shortening service composed of three containers:

1. **Frontend:** React application using Radix UI components
2. **API:** Node.js and Express API using Prisma ORM
3. **Database:** PostgreSQL

I chose this architecture to provide:

- Persistent data storage with the database
- The possibility of adding rate limiting in the api to prevent abuse

The monorepo architecture with Turborepo was to familiarize myself with Kabilioi's architecture. I used Docker Compose to simplify deployment and Vite to enable hot reload during frontend development.

## What I Would Do With More Time

<!-- What would you tackle next if you had more time? -->

### Frontend

- Add QR code generation
- Add a login/register page
- Add a URL statistics view
- Add additional URL statistics, such as:
  - Clicks per day, week, or month
  - Click distribution by hour of day
  - Browser categories
  - Operating-system categories
  - Country-level click counts

### Backend

- Add rate limiting
- Add user profiles for better UX

## AI Usage

<!-- How did you use AI tools (if any)? Include some example prompts if you used any agent. -->

I added an `AI_DOC.txt` file containing most of the prompts used during the development process.

The prompts are organized into development phases, which could also represent separate commits.

Please take into account that some basic questions allow me to foresee how the AI intends to respond and build.

## Feedback

<!-- Any feedback on the challenge? Was it clear? Too easy/hard? Suggestions? -->

The challenge was clear, but I would have liked more time to polish the frontend and add better UX with URL stats and user profiles.
