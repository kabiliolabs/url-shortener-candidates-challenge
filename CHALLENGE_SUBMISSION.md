# Submission

## What I Did

I refactored the app with a clear backend/frontend split, persistence, and a usable UI.

**Backend:** Layered structure (routes → handlers/loaders → services → repository → db). Short codes are 6-char alphanumeric with collision handling. URL validation, request-body parsing, Prisma/PostgreSQL repository, and in-memory rate limit on shorten. Centralized error messages.

**Frontend:** Implemented MUI + Tailwind. Jotai for form and URL list state, TanStack Query for the shorten mutation. Validation and inline error feedback.

**Docs & tooling:** README (setup, Docker, usage, tech stack, what changed). BACKEND.md, FRONTEND.md, DATABASE.md.

**Tests:** Added tests to validate that components and API calls work correctly.

---

## What I Would Do With More Time

- **Structure:** Improve project structure (e.g. clearer boundaries between layers, shared types, or feature-based grouping where it helps).
- **Stack:** Use more of the stack in depth—e.g. TanStack Query for caching and refetch strategies, Jotai for more derived state and persistence where it makes sense.
- **More tests:** Handler/route and integration tests; more error-path coverage and edge cases consideration.
- **Zod:** Request/response and env validation; schemas as single source of truth for types and runtime checks.
- **Accessibility:** Focus on making the app accessibility-focused.
- **E2E:** Short Playwright flow (shorten → visit link → confirm list updates).

---

## AI Usage

I used **Cursor** (IDE with integrated AI) and **Gemini**. With Cursor: task-based prompts (e.g. “add rate limiting,” “move URL list to Jotai”) for implementation, refactors, and docs. We worked more as a pair—I set the design and also wrote code; the AI proposed changes and reviewed mine. Iterative flow: ask → review diff → tweak → next task. For opinions on stacks, technologies, and issues that came up, I used Gemini for a second opinion and elaborated a solution from that. I stayed in the loop on every change.

---

## Feedback

- The problem and requirements were clear; the “deliberately flawed” setup made it obvious what to improve and left a lot of room for improvement.
- Two hours is probably too little time to see what should be prioritized, especially in a fullstack environment. Its hard to analize, implement and test all the possible screnarios and architectures that can be created.
