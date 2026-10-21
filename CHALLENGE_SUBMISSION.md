# Submission

## What I Did

<!-- Briefly describe what you implemented or improved. What did you prioritize and why? -->

**What was built**

- Hexagonal architecture + DDD: domain and use cases isolated from React Router and Prisma.
- Unique 7-char codes (the old generator had 9 possible codes), URL validation that blocks
  `javascript:` and similar, click tracking with atomic updates.
- PostgreSQL with Prisma, data survives restarts, migrations run on startup.
- New UI with shadcn/ui, stats page with pagination, loading and error states.
- Rate limiting, 47 tests (unit + integration against real Postgres), Docker working from scratch.

**What I prioritized:** a solid core and correctness first (architecture, validation, persistence,
tests), then the UI. Everything is documented in SPECS.md and DECISIONS.md.

**How I worked**

- Understood the project and its starting point. Ran the code to see how it behaved.
- Defined the role of the AI (Claude Code) and how I'd use it.
- Wrote the specs, asked the AI for extra cases I might have missed and reviewed each spec.
- Implemented the specs block by block. Reviewed every change before committing, tested that it
  worked and suggested improvements. Asked the AI for a summary of each block to write the commit,
  reviewed the message and kept the co-author line on purpose. Reviewed the tests of every block.
  Checked the database to understand the flow end to end.
- Didn't move to the next block until the project ran and the block was validated, so every
  commit leaves the repo working.
- Wrote down every decision as it was made (DECISIONS.md).
- Final review: asked the AI to run Docker from a clean clone to confirm it works out of the box.

## What I Would Do With More Time

<!-- What would you tackle next if you had more time? -->

**Security and abuse**

- User accounts, so each user only sees their own links. Right now `/stats` is public and shows
  every link.
- Check URLs against a list of malicious domains (e.g. Google Safe Browsing) before shortening,
  since shorteners are often used to hide phishing.
- Rate limit per real client IP, with a custom Express server or a trusted proxy in front. Today
  every request shares one counter, because the IP header can be faked (ADR-010).
- Move the rate limiter to Redis so it works across several instances (ADR-008). Thanks to the
  `RateLimiter` port it's just a new adapter.

**Better stats and new features**

- Improve the stats: store each click as an event (date, referrer, country, browser), show clicks
  over time and filter out bots to count unique visitors.
- Delete or edit links, and let them expire.

**UI/UX**

- Polish the UI: dark mode, a better mobile view of the stats, search and filters, and nicer
  feedback like toasts.

**Quality**

- End-to-end tests with Playwright, and writing the domain tests before the code.
- CI with GitHub Actions running typecheck, tests and the Docker build on every push.
- Claude Code skills to review new tasks against the project conventions (architecture, specs,
  ADRs) before they're committed.

## AI Usage

<!-- How did you use AI tools (if any)? Include some example prompts if you used any agent. -->

**Tool:** Claude Code (Claude Opus 5.5) in VS Code, used as a pair programmer. I made the
architecture and scope decisions; the agent explored the code, drafted and implemented under my
review.

**How I steered it**

- [CLAUDE.md](./CLAUDE.md) holds the rules for the agent: architecture and dependency rule,
  workflow, comment style and commit conventions.
- I defined the specs in [SPECS.md](./SPECS.md) before any code. The agent wrote the final
  wording and suggested extra cases, which I reviewed one by one.
- [DECISIONS.md](./DECISIONS.md) was updated in every block, so the reasoning doesn't get lost.
- At the end of each block the agent stopped and proposed a commit message. I reviewed the diff
  and the message, rewrote it where needed, and only then it was committed. Commits keep the
  `Co-Authored-By: Claude` line on purpose, so the history reflects how the work was done.

**Example prompt** (the setup that drove the implementation, condensed into a single prompt)

```text
You're a senior full-stack engineer helping me refactor this URL shortener for a technical
challenge (~2h). Read CHALLENGE_DESCRIPTION.md and the code before doing anything.

Goal: a service that shortens URLs with unique codes, redirects them and tracks clicks, with a
clean UI, Postgres persistence, abuse protection and tests. It must run with
`docker compose up --build`.

Constraints:
- Hexagonal architecture + DDD. Business rules live in libs/engine and know nothing about
  React Router or Prisma. Adapters go in a separate package.
- Postgres with Prisma, behind a repository port. shadcn/ui for the components.
- Everything in the repo in English. Comments short, explaining why, not what.

How to work:
1. First audit the current code and give me a plan in blocks. Don't write code yet.
2. Before implementing, write SPECS.md with one short paragraph per feature, and wait for my review.
3. Then go block by block. For each block: implement, add tests, start the app and check it
   works, and log any non-obvious decision in DECISIONS.md.
4. When a block is done, stop. Give me a summary and a proposed commit message. Don't commit
   until I approve it, and never push.
5. If something is ambiguous or there's a real trade-off, ask me instead of guessing.
```

## Feedback

<!-- Any feedback on the challenge? Was it clear? Too easy/hard? Suggestions? -->

- The challenge is clear and fun: a small, well-known domain with deliberate flaws gives a lot of
  room to show how you think, not just how you code.
- I liked that AI is allowed and that you ask to document how it's used. It's closer to how we
  actually work today.
- ~2 hours is tight for everything in the requirements (UI, database, security, tests and Docker).
  It forces you to prioritise, which I guess is the point, but it could be worth saying which areas
  matter most to you.
