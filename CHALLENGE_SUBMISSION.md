# Submission

## What I Did

- Added `applications/api`, a small Node.js HTTP API backed by MongoDB through
	Prisma ORM.
- Applied a repository abstraction (`ShortenedUrlRepository`) with a
	`PrismaUrlRepository` implementation. The Prisma schema declares the unique
	`code` index, and data is stored in a persistent Docker volume.
- Added a `UrlService` for the domain use cases: create, resolve while tracking
	clicks, and list recent URLs. Code generation uses cryptographic random bytes
	and retries safely if the database rejects a duplicate code.
- Updated the React Router server routes to call the API rather than using the
	previous in-memory `Map`.
- Added input validation, request-body limits, JSON security headers, and an
	in-memory rate limit of 10 URL creations per IP per minute.
- Added Node's native test-runner coverage for URL validation, collision retry,
	click tracking, and rate limiting.

## What I Would Do With More Time

- Add distributed rate limiting (for example Redis) so limits work across API
	replicas, plus observability and structured logs.
- Add authentication or CAPTCHA/proof-of-work if anonymous public creation is a
	product requirement.
- Add API integration tests against an ephemeral MongoDB instance and improve
	the frontend with the required URL statistics screen and request loading state.
- Add a URL reputation/allow-list policy based on product requirements.

## AI Usage

- Used GitHub Copilot to inspect the existing monorepo and identify the current
	in-memory URL flow.
- Used it to scaffold the repository/service/API layers, generate focused tests,
	and run type checks and tests. All generated changes were reviewed and tested
	locally with `pnpm --filter @url-shortener/api test` and `pnpm typecheck`.

## Feedback

- The challenge is clear and gives useful scope guidance. The two-hour limit
	makes prioritisation explicit, which is valuable for evaluating trade-offs.
