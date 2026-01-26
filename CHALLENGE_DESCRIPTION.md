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
- **Fill in [CHALLENGE_SUBMISSION.md](./CHALLENGE_SUBMISSION.md)** before submitting. Document what you did, your AI usage, and any feedback.

> **Important:** Your solution should run on Docker. Keep instructions in the [README.md Docker Setup section](./README.md#docker-setup) updated and verify it works correctly before submitting.

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
- Testing for important parts of the application
