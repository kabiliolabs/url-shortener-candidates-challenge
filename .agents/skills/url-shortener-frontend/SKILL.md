---
name: url-shortener-frontend
description: Implement or review React Router UI, components, accessibility, and user feedback for the URL-shortener product. Do not use for Prisma schema or backend-only domain work.
---

# URL shortener frontend

Read `../../../docs/PROJECT_CONTEXT.md` and `../../../docs/ARCHITECTURE.md`
before changing frontend code. Preserve the existing draft and reuse the
current React Router and Tailwind stack.

## Working method

1. Identify the user-visible behavior and its loading, success, empty, and error
   states before editing markup.
2. Keep route modules focused on loader/action integration and page composition.
3. Extract components when they own a coherent UI responsibility or are reused;
   do not split markup merely to increase file count.
4. Use React Router navigation/fetcher state instead of parallel client request
   state where possible.
5. Test critical behavior and accessibility, then run typecheck and build.
6. Update documentation when UX behavior or limitations change. Never report
   unexecuted verification as completed.

## Frontend expectations

- The form has an associated label, preserves useful input on validation errors,
  disables duplicate submission, and exposes feedback with appropriate live or
  alert semantics.
- The created short URL is actionable and has copy feedback that works by
  keyboard. External links use safe `rel` attributes.
- The statistics list displays destination, short URL, creation date, and click
  count responsively, with a useful empty state.
- Error boundaries match the visual language of the page and provide a recovery
  path.
- Components never import Prisma or instantiate application dependencies.
- Server-provided errors are shown intentionally; unexpected internal details
  are not rendered.
- Styling remains consistent and accessible, including focus visibility and
  sufficient contrast. A new component library requires a concrete payoff.
