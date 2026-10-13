# Agent working agreement

Before changing this repository, read `docs/PROJECT_CONTEXT.md` and
`docs/ARCHITECTURE.md`. For backend/domain work also read
`.agents/skills/url-shortener-backend/SKILL.md`; for UI work read
`.agents/skills/url-shortener-frontend/SKILL.md`.

## Shared constraints

- `CHALLENGE_DESCRIPTION.md` and `CHALLENGE_SUBMISSION.md` are protected input
  artifacts. Agents must not edit, rename, move, delete, format, or regenerate
  either file. If requested work appears to require changing them, stop and ask
  the repository owner for direction.
- Treat the existing draft implementation as work in progress. Preserve it and
  avoid unrelated formatting or line-ending rewrites.
- Prefer a small, explicit design over framework-like abstractions. Add
  complexity only when it protects a domain rule or an operational requirement.
- Work test-first for domain rules and application use cases: add a failing
  behavioral test, implement the smallest change, then refactor.
- Dependencies point inward: delivery and infrastructure may depend on the
  application/domain, never the reverse.
- Keep React Router loaders and actions thin. They translate HTTP input/output
  and delegate business behavior to use cases.
- Prisma is an infrastructure detail. Domain and application modules must not
  import Prisma types or clients.
- Do not claim a command or Docker flow was verified unless it was actually run.
- Record meaningful architectural and implementation decisions in the relevant
  project documentation. Every change must remain understandable and
  maintainable by the engineering team.

## Definition of done

A change is complete when its relevant tests pass, type checking and build pass,
errors have intentional user-facing behavior, documentation still matches the
implementation, and no unrelated user changes were overwritten.
