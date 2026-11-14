# Submission

## What I Did

- [10 min] Set up CortexDB project memory and knowledge graph, and added agent instructions in `AGENTS.md` to preserve context and guide implementation. See "AI Usage" for details.
- [15 min] Get familiar with the codebase and run the application locally.

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

## Feedback

<!-- Any feedback on the challenge? Was it clear? Too easy/hard? Suggestions? -->
