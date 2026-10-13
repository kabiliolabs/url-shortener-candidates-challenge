# AI-Assisted Engineering

## Purpose

AI was used as an engineering assistant to accelerate exploration, propose
small implementation steps, and review changes. It did not replace ownership
of the design, code, or verification decisions.

## How AI was used effectively

- **Codebase exploration:** locate delivery, domain, persistence, and Docker
  concerns before changing them.
- **Design discussion:** compare options for clean boundaries, repository
  ports, Prisma/PostgreSQL persistence, and click tracking.
- **Implementation support:** draft focused changes for value objects, use
  cases, route handlers, Prisma adapters, reusable UI pieces, and docs.
- **Review support:** search for stale JSON persistence, duplicated URL
  construction, unused exports, and mismatches between code and documentation.
- **Verification support:** identify the appropriate checks and help interpret
  compiler, test, Prisma, Docker, and runtime errors.

## Responsible use

- Architecture decisions were made deliberately and recorded in
  `docs/ARCHITECTURE.md` and `docs/EXECUTION_PLAN.md`.
- Every generated or suggested change was read, adapted when necessary, and
  checked against the repository before it was kept.
- AI output was treated as a proposal, not as an authority. The engineer
  remains responsible for correctness, security, maintainability, and product
  behavior.
- No credentials, production customer data, or private business data were sent
  to AI as part of this work.
- Automated checks were run after implementation; passing output is recorded
  in `docs/VERIFICATION.md`.

## What was not delegated to AI

- Final product and architecture ownership.
- Approval of destructive actions or changes to protected challenge artifacts.
- Trusting a change without compiling, testing, or exercising the behavior.

## Outcome

The workflow used AI to reduce mechanical work and make the reasoning more
explicit, while preserving human review and reproducible verification as the
source of confidence.
