# Proposal

## Why

The current UI (`applications/web/app/routes/_index.tsx`) is deliberately garish, inconsistent Tailwind with no reusable components, no loading state, no stats view, and a raw error string as its only feedback - none of which meets the challenge's "clean, modern UI," "reusable components," "robust error handling," or "listing with statistics" requirements. The backend changes in this series (`click-tracking-and-abuse-protection`, `persistent-storage-with-prisma`) now provide real validation errors, rate-limit responses, and a stats endpoint for the UI to actually use.

## What Changes

- Rebuild the shorten form and result UI with shadcn/ui (Radix-based) components on a consistent Tailwind design-token base, replacing the current one-off class soup.
- Shorten form uses `react-hook-form` with a Zod resolver that wraps the same framework-free domain predicate the backend uses (`assertShortenable`, from `click-tracking-and-abuse-protection`'s domain layer) via `.superRefine()`, rather than hand-duplicating the rule or importing the backend's infrastructure-layer Zod schema; validation errors show inline, next to the field.
- Submit control is disabled and shows a loading indicator for the duration of the request (via React Router's navigation state).
- Result card shows the shortened URL, a link to open it, and a copy-to-clipboard control with visible confirmation once copied.
- New URL list/table view consuming `GET /api/urls`: original URL (truncated, full value on hover/title), short URL, click count, creation date - with distinct loading, empty, and error states.
- A typed API client layer wraps the backend calls and maps structured backend error codes (from the `error-handling` capability), the 429 rate-limit response, and network failures to user-appropriate messages.
- Responsive layout and accessibility: labeled form fields, visible focus states, and an `aria-live` region announcing validation/result/error state changes.

## Out of Scope

- Any backend endpoint behavior - this change only consumes what `click-tracking-and-abuse-protection` and `persistent-storage-with-prisma` already provide.
- Authentication or per-user views.
- Theming beyond what Tailwind/shadcn provide by default (no dark-mode requirement stated).

## Capabilities

### New Capabilities

- `web-ui`: the observable UI behavior contract - inline validation feedback, in-flight loading state, copy-to-clipboard confirmation, the URL list's loading/empty/error/populated states, and the accessibility behavior (labels, focus, live-region announcements) users rely on.

### Modified Capabilities

(none)

## Impact

- `applications/web/app/routes/_index.tsx`: rebuilt form, result card, loading state.
- New: a URL-listing route/page consuming `GET /api/urls`.
- New: `applications/web/app/components/` (shadcn/ui primitives: Button, Input, Card, Alert, Table) and an API client module.
- New dependencies: shadcn/ui's Radix primitives, `react-hook-form`, `@hookform/resolvers`.
- Reuses the `assertShortenable` domain predicate introduced in `click-tracking-and-abuse-protection` (wrapped in its own Zod resolver) rather than adding a second copy of the validation rules.
