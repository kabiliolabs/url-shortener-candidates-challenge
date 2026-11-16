# Design

## Context

`applications/web` already depends on `@url-shortener/engine` as a workspace package. `click-tracking-and-abuse-protection` introduces the actual URL-acceptance rule as a framework-free predicate (`assertShortenable`) in that package's domain layer, with a Zod schema in its infrastructure layer wrapping that predicate only for HTTP-boundary parsing. See `proposal.md` for motivation and `specs/web-ui/spec.md` for the resulting UI contract.

## Goals / Non-Goals

**Goals:**
- Reuse the backend's actual validation rules on the client instead of hand-duplicating them, so the two can't silently drift.
- Get accessible interactive primitives (focus management, keyboard behavior) largely for free rather than hand-rolling them.
- Keep client-side validation as a UX convenience only - the server remains the source of truth.

**Non-Goals:**
- A component library usable outside this app.
- Removing or weakening server-side validation in favor of trusting the client (the server re-validates independently regardless of what the client does).

## Decisions

**Frontend imports the domain predicate, not the backend's Zod schema.** The actual URL-acceptance rule lives once, as the framework-free `assertShortenable` predicate in `libs/engine/src/domain` (introduced by `click-tracking-and-abuse-protection`). The frontend does not import the backend's infrastructure-layer Zod schema; it wraps that same domain predicate in its own `react-hook-form` Zod resolver via `.superRefine()`. This keeps `domain` free of any framework dependency (per `refactor-backend-architecture`) while still guaranteeing both sides enforce the identical rule, and it avoids ever bundling infrastructure code (which may reference Prisma) into the browser. Alternative considered: import the backend's Zod schema directly, since `applications/web` already depends on `@url-shortener/engine`. Rejected - that schema lives in infrastructure and could transitively pull in Node-only code (e.g. Prisma) into the client bundle; importing only the pure domain predicate avoids that risk entirely. Alternative also considered: hand-maintain a second, parallel validation schema in the frontend. Rejected - that's exactly the duplication the proposal explicitly wants to avoid, and two independently-maintained copies of "what makes a URL valid" will eventually disagree.

**shadcn/ui (Radix primitives) over fully bespoke components.** shadcn/ui components are copied into the repo as source (not a black-box runtime dependency) and are built on Radix, which provides correct keyboard navigation, focus management, and ARIA attributes out of the box. Given the `web-ui` spec's accessibility requirements (focus states, labeled fields) and a 2-hour budget, hand-rolling that behavior from scratch is not a good use of the remaining time. Only the specific primitives needed (Button, Input, Card, Alert, Table) are pulled in, not the full library.

**`react-hook-form` + `@hookform/resolvers/zod` over hand-rolled `useState` form wiring.** Integrates directly with the shared Zod schema with minimal glue code and avoids re-implementing validation-state wiring (touched/error/pending per field) by hand - a meaningful amount of code for a 2-hour budget that a maintained library already solves.

**Client-side validation is a convenience layer, not a trust boundary.** The client validates with the same schema purely to give the user instant feedback before a round trip; the server (`click-tracking-and-abuse-protection`) independently re-validates every request regardless, since client-side checks are trivially bypassable (e.g. via a direct API call).

## Risks / Trade-offs

- [Importing the backend's infrastructure-layer Zod schema directly (instead of the domain predicate) could accidentally pull server-only code, e.g. Prisma, into the browser bundle] -> Mitigation: the frontend only ever imports the framework-free `assertShortenable` predicate from `libs/engine/src/domain`, never anything from `libs/engine/src/infrastructure`; verify the client build output doesn't include Prisma.
- [shadcn/ui's copy-into-repo model means updates don't come from a version bump] -> Mitigation: acceptable for a 2-hour challenge scope; the components needed here are small and stable.
