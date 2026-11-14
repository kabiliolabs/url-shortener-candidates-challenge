# Submission

## What I Did

- [10 min] Set up CortexDB project memory and knowledge graph, and added agent instructions in `AGENTS.md` to preserve context and guide implementation. See "AI Usage" for details.
- [15 min] Get familiar with the codebase and run the application locally.
- Extracted custom React components and separated the shortener's controller from its view, preserving the existing behavior and design.
- Added URL domain objects and server validation with shared result types, keeping the current in-memory storage.

## Decisions and Rationale

Decisions for the [component refactor](specs/reusable-components.md):

- **Custom components over shadcn/ui or Radix:** the current controls are simple, so reusing their markup and CSS avoids unnecessary dependencies.
- **Controller–view separation:** keep application logic separate from rendering and reusable components.
- **Colocate by responsibility:** keep shared controls in individual `components/ui` folders, and page controllers/views beside their route module so page-specific code stays together.
- **Preserve behavior and design:** isolate the refactor from new features, bug fixes, and visual changes.
- **Focused verification:** add colocated Vitest/React Testing Library unit tests for the controller, view, and controls, alongside typecheck, build, and browser checks. Isolated route stubs keep unit tests independent of server storage.

Decisions for the [URL domain model](specs/url-domain-model.md):

- **Separate syntax from policy:** shared `URL` parses absolute URLs across protocols and exposes the protocol; `ShortenedURL` enforces HTTP/HTTPS destinations through guarded creation. Repository abstraction and database persistence remain deferred.
- **Explicit validation results:** `safeParse` accepts a string and returns the shared `Result` contract instead of throwing for invalid URL strings. Application use cases now reject missing/non-string input; the HTTP boundary maps validation errors to HTTP 400 and the existing inline feedback.
- **Test the boundaries:** pure domain tests cover validation and value equality; route tests verify rejection without storage changes and preserve successful shortening/redirect behavior.

Decisions for the [shortener use cases](specs/shortener-use-cases.md):

- **Separate orchestration from HTTP:** use cases validate application input and coordinate shortening/lookup; routes construct public links, responses, and redirects.
- **Keep domain rules authoritative:** Zod checks string/nonblank input; the shared URL validates structure and the aggregate validates destination policy before code generation. Expected failures use the shared `Result` contract, preserving existing HTTP feedback.
- **Organize by module:** shortener code lives under `modules/url-shortener`, with application `usecases` and `validations` and the aggregate directly in `domain`. Generic URL and results live under `shared/value-objects` and `shared/types`. The existing map and generator remain until repository abstraction is introduced.

Decisions for the [database foundation](specs/database-foundation.md):

- **Keep infrastructure separate:** a private PostgreSQL/Drizzle package owns its pool and explicit lifecycle; consumers provide configuration and schemas. The engine and web retain their in-memory behavior.
- **Use Drizzle Kit directly:** the package integration test generates temporary schema/configuration/SQL fixtures and runs explicit migration commands. There is no demo consumer workspace, committed fixture migration, or custom migration executor.

## What I Would Do With More Time

<!-- What would you tackle next if you had more time? -->

## AI Usage

I started by using an AI coding agent to understand the existing codebase and set up CortexDB as persistent project memory. The stored context covers the challenge requirements, architecture, file responsibilities, request flow, and known baseline limitations. A knowledge graph records explicit relationships between files and symbols, such as imports, route registration, and shared-state access, with source references.

I also added `AGENTS.md` with repository structure, development commands, coding conventions, and verification guidance. Its CortexDB instructions tell the agent to retrieve relevant context before non-trivial changes, check recalled facts against the current source, and preserve verified decisions with their provenance. They distinguish static inspection from executed checks and require reading saved information back to verify persistence.

The goal of this setup is to preserve context across sessions and reduce repeated exploration while keeping later implementation grounded in the code and challenge requirements. The initial analysis used static source inspection; application tests, builds, and Docker startup had not yet been run.

Example prompt used to retrieve the saved project context:

> Retrieve information from cortex db

Additional example prompts for this workflow:

- "Recall the URL shortener's architecture and known limitations from CortexDB, then verify the relevant facts against the current source."
- "Use the CortexDB knowledge graph to identify which routes read or write shortened URLs. Include the source references for each relationship."

For relationship queries, the agent first calls `graph_schema` to inspect the stored node and edge types, then uses `graph_cypher_query` to retrieve explicit connections.

![Project knowledge graph in CortexDB](screenshots/Screenshot%202026-11-14%20at%2009.52.46.png)

_Project knowledge graph in CortexDB._

### UI Restyling Specification

I used the AI coding agent to draft and refine a short, high-level [UI restyling specification](specs/ui-restyling.md) before starting implementation. I defined the goal and scope: improve the appearance, remove decorative characters and rotated boxes, and preserve existing functionality without adding components.

I established a light-mode color palette using off-white, dark green, and lime, then adapted the same colors for dark mode. Both themes follow the system preference through CSS. The agent calculated contrast ratios for the proposed text and button color pairs to check their readability.

I then asked the agent to compare the spec against the existing code and identify inconsistencies and gaps. We discussed the findings one by one and updated the spec with the agreed changes: coverage of both inline errors and full error pages, long-content handling, keyboard focus, and centralized CSS classes that replace conflicting styling utilities. Functional issues found during the review stayed outside the restyling scope.

This process produced a concise specification with explicit boundaries and acceptance criteria to guide implementation.

#### Implementation Process

I asked the main agent to coordinate the work through separate planning, implementation, and validation subagents:

1. **Read the spec.** The main agent read the agreed specification and checked the repository state to establish the scope and preserve existing work.
2. **Create the plan.** The main agent passed the spec to a planning subagent. It retrieved relevant context from CortexDB, verified it against the current code, and identified the required changes, affected files, behavior to preserve, and verification steps.
3. **Implement the changes.** The planning subagent returned its findings to the main agent, which passed the spec and plan to a new implementation subagent. That agent updated the CSS and existing component classes, removed the decorative characters, and ran typecheck and build checks.
4. **Validate independently.** Once implementation was complete, the main agent assigned a new validation subagent to compare the spec, planned tasks, and actual changes. It checked source-level behavior preservation and exercised the application in a browser across light and dark themes at mobile and desktop widths.

The independent validation found no blocking mismatches, so no correction round was needed. Typecheck, build, and browser checks passed. The main agent reviewed the results and representative screenshots before reporting completion.

I then packaged this workflow as the reusable [implement-spec skill](.agents/skills/implement-spec/SKILL.md). It defines the agent handoffs, CortexDB context retrieval, implementation boundaries, independent validation, and correction process for future specifications. It can be invoked with `Use $implement-spec for specs/my-feature.md`.

### Reusable Components

I used [start-feature](.agents/skills/start-feature/SKILL.md) to clarify the component refactor and write its spec, then used the planning, implementation, and independent validation workflow above.

### URL Domain Model

I used [start-feature](.agents/skills/start-feature/SKILL.md) and the installed [hexagonal-architecture skill](.agents/skills/hexagonal-architecture/SKILL.md) to define a small domain-first step. The spec adopts a generic `Result` type inspired by my existing utility code and keeps HTTP and storage concerns outside the domain objects. After approving the spec, I used [implement-spec](.agents/skills/implement-spec/SKILL.md) for planning, implementation, and independent validation. The implementation first demonstrated failing validation/trim tests against the original action, then added domain objects and server integration.

### Shortener Use Cases

I used the same specification workflow to extract `ShortenURLUseCase` and `ResolveShortenedURLUseCase`, then included the module/shared folder organization during implementation. The implementation first reproduced the missing invalid-code response with a failing route test, then added Zod validation and use-case tests while preserving the existing storage and HTTP contracts.

### Database Foundation

I approved the database foundation specification, then used the same separate planning,
implementation and independent validation workflow. The agent used the hexagonal
architecture skill to preserve the domain/infrastructure boundary and added failing
public-API tests before implementing the database lifecycle. The concrete `PostgresDatabase` class owns
the pool and exposes a typed client, health checks, and cleanup. Integration checks use real PostgreSQL
and explicit Drizzle Kit commands with temporary fixtures. After reviewing the first
implementation, I removed the extra test-consumer workspace to reduce scaffolding. Database durability does not yet make shortened URLs
persistent; repository integration is deferred.

## Feedback

<!-- Any feedback on the challenge? Was it clear? Too easy/hard? Suggestions? -->
