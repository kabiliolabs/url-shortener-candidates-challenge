# Submission

## What I Did

My approach was divided into 5️⃣ distinct phases: **Setup**, **Audit**, **Discovery and High-level Evaluation**, **Prioritization Strategy**, and **Transformation and Architectural Decisions**.

Focused on:

- **Persistence**
- **Frontend** (High-level)
- **Infrastructure and service reliability**

#### Sample

https://github.com/user-attachments/assets/03e2af68-e6f9-4650-a7bf-31b73503339a


#### **Phase 1: Environment Setup & Version Control**

The project began by **forking the upstream repository** from `kabiliolabs`. I established a clean development branch to maintain a clear history of my refactor and ensured the local development environment was isolated to avoid dependency conflicts.

#### **Phase 2: Security & Integrity Audit**

Before writing any code, I conducted a preliminary security audit of the forked repository.

- **The Goal**: Ensure no malicious hooks (postinstall), obfuscated eval calls, or destructive scripts existed in the upstream source.
- **How**: Performed a security audit using **Grok (xAI)** by scanning the full codebase and script files.
- **Result**: Confirmed a safe baseline. I then established an environment to ensure a clean “disposable” workspace.

#### **Phase 3: Smoke Testing & “End-User” Validation** (Discovery)

I performed a manual “Smoke Test” on the code to identify the most critical points of failure, and checked how the application was working from a user perspective.

#### **Phase 4: Prioritization Strategy**

Ensure the core shortening and redirecting URLs worked in a production-like environment before layering on complexity.

I applied a **MoSCoW** framework combined with an **Impact vs. Effort Matrix** to decide where my time would yield the most positive results.

- **Must-Haves (High Impact):** Persistence (Redis), Collision-free generation (Base62), and Docker reliability. These were prioritized as the **"foundation."**
- **Should-Haves (High Impact/Medium Effort):** A bold web design (Radix Themes+Tailwind) and Type-safe validation (Zod).
- **Could-Haves (Low Impact/High Effort):** I explicitly deferred **Image Size Optimization** and **Full Unit Test Coverage** to the “Future Work” section to protect the delivery of core functionality.

#### **Phase 5: Transformation and Technical Decisions**

- **Redis over Prisma ORM + Other DDBB solution:** The guidelines suggested Prisma, but I went with a Redis-backed solution in the end.
    - A URL shortener is a **Read-Heavy, Key-Value** problem that can be addressed by using these technologies (They are natively optimized for these scenarios).
    - Prioritized simplicity over data-handling complexity just to reduce the overhead of the solution.
    - Redis is lightweight in a Docker Compose environment, aimed at ensuring the functional baseline of this development effort (core feature).

- **Pre-flight check (Entrypoint script to check service readiness):** In a containerized environment, service orchestration is often problem of production stability. In other words, when we have a `docker-compose`, having a `depends_on` property (without a **health check**) we need to ensure that the service container has **started**, not that the engine is **ready**.

- **Brief separation of concerns and State vs. Presentation:** Basic separation of business logic from the specific repository implemented.
    - **The Port (`UrlRepositoryPort`):** An interface that defines _what_ the app needs to do (e.g., "Save this URL").

    - **The Adapter (`RedisUrlRepository`):** The specific implementation that tells the app _how_ to do it using Redis.

    - The domain doesn't need to know if the storage is Redis, PostgreSQL, or a simple file.

    - On the front-end side,
        - **Validation Layer (`Zod`):** All logic for what constitutes a "valid URL" is kept in a schema file, not inside the Button or Input components.
        - **Presentation Layer (`Radix Themes`):** These components handle the "look and feel" and accessibility (Aria labels).
        - **Logic Layer (`React Hook Form`):** This manages the "state" of the form.

## What I Would Do With More Time

Since I prioritized a **Core-Functional Baseline** within the time window (plus additional time to check everything), I would focus the next iterations on:

1.  **Comprehensive Testing Suite:** Implement **Integration Tests** for the Redis repository and **E2E Tests** using `Playwright` for instance.
2.  **Security Hardening:** Implement **Rate Limiting** at the infrastructure level to prevent automated scripts from exhausting the services for instance.

3.  **UI Polish:** Polish up the UI (making it more appealing). Also, adding the additional views suggested.

## AI Usage

I utilized AI (Grok, Gemini, GPT, xAI) either as a code generator, thinking partner, or an auditor.

- **Thinking partners:** Gemini and Grok to outline the strategy and going over some of the main ideas and concepts about architectural decisions, technologies, and best approaches.

- **Code generator:** Usage of `opencode` along with Grok 4.1 Fast (Reasoning model) from xAI provider. Also, GPT from VSCode, for evaluating code and checking out the UI.

- **Auditor:** xAI models to check that the implementation was going as I planned (swtiching between plan/build mode while addressing the problems).

## Feedback

The challenge is a good simulation of real-world technical triage. I appreciated starting with an existing codebase, as it mirrors the common task of inheriting legacy/prototype code.

My primary challenge was resisting the urge to simply 'patch' the bugs; It's easy to fall into the 'vibe-coder' trap (debugging issues and code generated on the fly 😂).

I focused on prioritizing the tasks, needed to ensure the core functionality, by fixing the critical flaws that would prevent a production launch:

- The 9-code collision limit,
- The volatile in-memory storage,
- The lack of a functional UI.

Ultimately, I believe success in this challenge isn't about finishing every feature, but demonstrating the judgment to know which _technical debt_ is acceptable to defer to ensure a reliable service.
