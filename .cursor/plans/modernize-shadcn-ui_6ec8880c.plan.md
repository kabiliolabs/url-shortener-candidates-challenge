---
name: modernize-shadcn-ui
overview: Refresh the existing URL shortener experience with a cohesive modern UI built from appropriate shadcn components, while keeping the current React Router server-first flow and domain logic intact.
todos:
  - id: audit-current-ui
    content: Review the current route shell and choose a small set of shadcn components that materially improve the existing shorten flow.
    status: completed
  - id: modernize-shell
    content: Refresh the global app shell and design tokens so the app has a modern visual baseline.
    status: completed
  - id: rebuild-home-route
    content: Refactor the index route into a polished landing/form/result experience using shadcn primitives and small presentational components.
    status: completed
  - id: verify-and-document
    content: Run type/tests, check lints for edited files, and add the UI tradeoff notes to CHALLENGE_SUBMISSION.md.
    status: completed
isProject: false
---

# Modernize The URL Shortener UI

## Goal

Replace the intentionally loud starter styling in [applications/web/app/routes/_index.tsx](applications/web/app/routes/_index.tsx) with a polished, modern shadcn-based experience around the existing shorten flow. Keep the current loader/action architecture and avoid turning this into a broader dashboard feature.

## What I’ll Change

- Update the app shell in [applications/web/app/root.tsx](applications/web/app/root.tsx) and [applications/web/app/app.css](applications/web/app/app.css) so the site has a cleaner visual foundation: refined background treatment, better typography hierarchy, improved spacing, and more intentional error-state presentation.
- Redesign the main route in [applications/web/app/routes/_index.tsx](applications/web/app/routes/_index.tsx) into a modern landing-style layout with clear hierarchy, stronger CTA placement, and more usable success/error feedback while preserving the existing `loader()` and `action()` behavior.
- Install and use the shadcn components that add real UX value for this flow instead of trying to force every available component into the page. Likely additions: `card`, `input`, `label`, `alert`, `separator`, and one or two utility presentation components such as `badge` or `skeleton` if they meaningfully improve states.
- Extract small presentational pieces under [applications/web/app/components](applications/web/app/components) if the route starts getting too large, for example a shorten form panel and a result/feedback panel. Domain and data logic will stay in the current server modules.
- Update [CHALLENGE_SUBMISSION.md](CHALLENGE_SUBMISSION.md) with the UI/UX tradeoffs and why these specific shadcn components were chosen.

## Guardrails

- Preserve the current server-driven flow in [applications/web/app/routes/_index.tsx](applications/web/app/routes/_index.tsx): form posts still go through the route `action`, and the page still renders from `useActionData`.
- Do not expand scope into recent-links/history/stats surfaces.
- Do not add shadcn components unless they improve this actual workflow.
- Keep components small and typed, following the existing `~/components` and `~/lib` aliases configured in [applications/web/components.json](applications/web/components.json).

## Likely Files

- [applications/web/app/routes/_index.tsx](applications/web/app/routes/_index.tsx)
- [applications/web/app/root.tsx](applications/web/app/root.tsx)
- [applications/web/app/app.css](applications/web/app/app.css)
- [applications/web/app/components/ui](applications/web/app/components/ui)
- [applications/web/app/components](applications/web/app/components)
- [applications/web/package.json](applications/web/package.json) if additional runtime deps are required by selected shadcn components
- [CHALLENGE_SUBMISSION.md](CHALLENGE_SUBMISSION.md)

## Validation

- Run the app typecheck/test workflow for the web package.
- Check lint diagnostics on edited files.
- Ensure the success state, validation error state, and empty initial state all remain clear and accessible.

## Notes

The current page is functionally correct but visually extreme, with direct Tailwind styling embedded in the route component. This makes [applications/web/app/routes/_index.tsx](applications/web/app/routes/_index.tsx) the highest-value place to modernize first while leaving the URL-shortening behavior untouched.