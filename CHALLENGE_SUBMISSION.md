# Submission

## What I Did

### Presentation Layer

- Built a consistent interface with reusable components, URL input validation, accessible error feedback, and loading states.
- Added a `/urls` page for link statistics, destination URL search, and pagination.
- Added the short-code redirect route to fulfill the core redirection requirement and record successful redirects as clicks for the statistics page.
- Added a per-IP limit of 10 link-creation attempts per minute as a simple safeguard against bursts of automated submissions. Requests over the limit receive HTTP 429 and a `Retry-After` header. The in-memory limit is intended for a single application instance and is a basic abuse-prevention measure, not comprehensive protection.

### Application Layer

- Added a `ShortenedUrlService` and repository abstraction to coordinate link creation, lookup, and listing independently of the persistence technology.
- Reused existing links for normalized destinations, handled concurrent duplicate requests, and retried short-code collisions.

### Domain Layer

- Defined the shortened URL model and domain errors.
- Normalized destination URLs and restricted them to HTTP and HTTPS.

### Infrastructure Layer

- Added PostgreSQL persistence with Prisma and database constraints to prevent duplicate destinations and short codes.
- Integrated Nano ID for short-code generation and technical HTTP request logging.
- Updated the Docker setup for running the application and database.

### Testing

- Added unit tests for the URL service, URL validation, and rate limiter.

## What I Would Implement With More Time

If more time were available, I would prioritize the following improvements:

- Add authentication and authorization to restrict access to the `/urls` listing and its statistics. Once users are introduced, associate their actions with their accounts and add auditing to track relevant activity.
- Define an inactivity period for shortened URLs and implement a cleanup process that deletes links that have not been used during that period, avoiding unnecessary database storage.
- Add internationalization to support multiple languages and improve the user experience for a broader audience.
- Replace the current IP-based creation limit with CAPTCHA verification to help prevent abuse without relying on IP addresses alone.
- Check destination reachability before creating a short link by issuing an HTTP GET and requiring an HTTP 200 OK response, with timeouts and safeguards against requests to private or internal network addresses.
- Add different types of integration tests, including database and repository integration tests, HTTP/API tests, and end-to-end user-flow tests.
- Set up a CI/CD pipeline to run type checks and tests and build the Docker image on each pull request, then automate deployment once a target environment is defined.

## AI Usage

I used GitHub Copilot from the VS Code development environment. It helped me understand the application's initial state, behavior, and structure. Based on that review, I progressively requested improvements, including PostgreSQL persistence with a `UNIQUE` constraint to prevent duplicate destination URLs, integrating Prisma ORM, using Nano ID to generate short codes, adding technical request logs, writing unit tests, and improving the front end with input validation and reusable components.

I made these changes incrementally and validated the application as it evolved. Throughout the process, I also reviewed the implementation's alignment with Hexagonal Architecture, SOLID principles, Clean Code, and Clean Architecture.

Example prompts:

- "Analyze the current application and explain its architecture, dependencies, and main behaviors."
- "Add PostgreSQL persistence using Prisma, and enforce a UNIQUE constraint on destination URLs to prevent duplicate records."
- "Integrate Prisma into this project and use Nano ID to generate short codes."
- "Add technical request logging and unit tests for the URL service and URL validation."
- "Improve the front end with URL input validation and reusable components."
- "Review the implementation incrementally against Hexagonal Architecture, SOLID, Clean Code, and Clean Architecture, and suggest focused improvements."

## Feedback

Although the challenge's main goal was clear, there was some ambiguity about what should count as a click: whether it meant a request to an existing short URL or only when someone intentionally followed the redirect to the destination. The abuse-prevention scope was also unclear. IP-based limiting was one possible approach, but the appropriate solution depended on non-functional requirements that were not fully specified.

During the interview, it was mentioned that an AI agent could be used throughout the challenge. I therefore chose to extend the solution beyond its core requirements with usability features such as pagination and URL search, as well as technical request logging.
