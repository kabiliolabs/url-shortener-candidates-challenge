# Submission

## What I Did

- [10 min] Set up CortexDB project memory and knowledge graph, and added agent instructions in `AGENTS.md` to preserve context and guide implementation. See "AI Usage" for details.
- [15 min] Get familiar with the codebase and run the application locally.
- Extracted custom React components and separated the shortener's controller from its view, preserving the existing behavior and design.

## Decisions and Rationale

Decisions for the [component refactor](specs/reusable-components.md):

- **Custom components over shadcn/ui or Radix:** the current controls are simple, so reusing their markup and CSS avoids unnecessary dependencies.
- **Controller–view separation:** keep application logic separate from rendering and reusable components.
- **Colocate by responsibility:** keep shared controls in individual `components/ui` folders, and page controllers/views beside their route module so page-specific code stays together.
- **Preserve behavior and design:** isolate the refactor from new features, bug fixes, and visual changes.
- **Focused verification:** add colocated Vitest/React Testing Library unit tests for the controller, view, and controls, alongside typecheck, build, and browser checks. Isolated route stubs keep unit tests independent of server storage.

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

## Feedback

<!-- Any feedback on the challenge? Was it clear? Too easy/hard? Suggestions? -->
