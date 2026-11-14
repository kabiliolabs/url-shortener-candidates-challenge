# <Feature name>

<!--
How to use this template (Spec-Driven Development):
1. Copy it to specs/<feature-name>.md.
2. Fill sections 1-4 BEFORE writing any code. Leave nothing as "TBD" that blocks a task.
3. Get the spec reviewed and set Status to "Approved".
4. Implement task by task (section 5). Each task points to the requirements it satisfies.
5. Verify every acceptance criterion (section 6), then set Status to "Done".
If requirements change during implementation, update this file first, then the code.
-->

Status: Draft | Approved | In progress | Done
Owner: <name>
Last updated: <YYYY-MM-DD>

## 1. Context

<!-- Why this work exists. One short paragraph: the problem, who has it, and the outcome you want. -->

## 2. Scope

**In scope**

- <what this spec changes>

**Out of scope**

- <what it deliberately does not change, so nobody adds it "while they're there">

## 3. Requirements

<!--
One requirement per line, numbered R1, R2, ...
Each must be testable: someone can look at the result and say yes or no.
Write exact values (colours, text, limits, error messages), never "nice", "clean" or "fast".
-->

- **R1** — <requirement>
- **R2** — <requirement>

## 4. Design

<!--
How you will meet the requirements. Only decisions someone would otherwise have to guess:
files and components touched, data shapes, UI text, tokens, libraries.
Note alternatives you rejected and why, in one line each.
-->

**Files affected**

- `<path>` — <what changes>

**Decisions**

- <decision> — <reason>

**Open questions**

<!-- Must be empty before Status becomes Approved. -->

- <question>

## 5. Tasks

<!-- Small, ordered steps. Each one is independently reviewable and lists the requirements it covers. -->

| ID | Task | Covers | Status |
| --- | --- | --- | --- |
| T1 | <task> | R1 | Todo |
| T2 | <task> | R2 | Todo |

## 6. Acceptance criteria and verification

<!-- How you prove each requirement is met: an automated test, a command, or a manual check with exact steps. -->

| Req | How to verify | Result |
| --- | --- | --- |
| R1 | <test name, command, or manual steps> | — |
| R2 | <...> | — |

Always run: `pnpm typecheck` and `pnpm build`.

## 7. Change log

<!-- Dated entries for decisions and requirement changes made after approval. -->

- <YYYY-MM-DD> — Spec created.
