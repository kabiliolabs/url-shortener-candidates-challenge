# Reusable components

## Goal

Refactor the existing UI into custom reusable React components, separating application logic from rendering without changing the current appearance or behavior.

## Scope

### What should change

- Extract custom reusable components for the existing buttons, inputs, cards, and inline error feedback from the current markup and styles.
- Use these components in the current URL-shortening page, including its form and result display.
- Separate the page controller from its view.
- Reuse the existing CSS and named classes when composing the new components.
- Add unit tests for the shortener controller, view, and all reusable controls.

### What should not change

- Form submission, validation, shortening, storage, redirects, navigation, and error handling.
- Existing wording, visible controls, layout, responsiveness, and light/dark appearance.
- The application's functionality: no new features or fixes to existing functional issues.
- Runtime dependencies and component tooling: use the existing React, TypeScript, and styling setup without adding shadcn/ui, Radix, or other component libraries. Development dependencies for unit testing are in scope.

This feature permits new reusable components. The earlier restriction against adding components in [UI restyling](ui-restyling.md) applied to that work; its visual requirements remain the baseline here.

## Requirements

### Components

- Build small local React components around the existing native HTML elements and styles.
- Group reusable controls under `applications/web/app/components/ui`, with one folder per component: `button`, `text-input`, `card`, and `inline-error`.
- Colocate page-specific files by route: `applications/web/app/routes/home` contains `route.tsx`, `shortener.controller.tsx`, and `shortener.view.tsx`; `routes/redirect/route.tsx` contains the redirect loader. Register these modules in `routes.ts`, preserving `/` and `/s/:code`.
- Keep reusable controls in their own component folders. Simple presentational controls and loader-only routes do not need additional controller or view files.
- Keep reusable components independent of URL-shortening logic, route data, and storage. Supply content, native attributes, and callbacks through typed props.
- Preserve native form and link semantics, including the input's `name="url"`, `type="text"`, and `required` attributes, the submit button's type, and the result link's destination and new-tab behavior.
- Extract only the components needed by the current UI; do not introduce speculative variants or a general-purpose component framework.

### Controller and view

- The page controller reads route data and action results, coordinates application state, and supplies the view with data and any required callbacks.
- The view renders the page from its props. It does not read route data directly, access storage, generate short codes, or implement application handlers.
- Existing server loaders and actions may remain in their route modules, with their behavior unchanged. Keep server business logic out of client components.
- Preserve React Router form submission. Do not introduce client state or custom submit handlers merely to create a controller abstraction.

### Appearance

- Preserve the current typography, spacing, layout, visible keyboard focus, and long-content handling.
- Keep presentation styles in `applications/web/app/app.css` and reference them through named classes, preserving the existing design.
- Continue following the system color preference, without adding a theme toggle.

| Use | Light mode | Dark mode |
| --- | --- | --- |
| Background | `#f7f8f3` | `#182118` |
| Text | `#182118` | `#f7f8f3` |
| Main button background | `#182118` | `#c6f432` |
| Main button text | `#c6f432` | `#182118` |

### Unit tests

- Use Vitest, React Testing Library, and jsdom, with tests colocated as `*.test.tsx` beside the controller, view, and each reusable control.
- Test the controller's loader-data display, form submission, and action-result/error transitions using isolated React Router stubs; do not call the real shortening action or shared storage.
- Test the view's initial, success, and error states, native form validation, and result-link attributes.
- Test reusable controls through rendered content, native attributes, callbacks, disabled/required behavior where applicable, and existing presentation classes.
- Provide `pnpm test` from the repository root. These DOM-based tests complement the existing browser checks; they do not verify CSS layout or real HTTP redirects.

## Acceptance criteria

- The existing form, cards, and inline error feedback use the reusable components. The page view receives its data through props, with application coordination in the controller and server logic outside the view.
- The reusable components are local React implementations using the existing dependencies; no UI library or component tooling is added.
- Each reusable control has its own folder; the shortener controller and view are colocated with the home route module, and public URLs and server loader/action behavior remain unchanged.
- Submitting a URL produces a shortened link as before; following it redirects to the submitted destination. Empty input retains the existing validation behavior.
- Existing inline errors and full error pages retain their messages and rendering conditions. Unknown routes and short codes behave as before.
- Browser checks cover the home page, successful result, inline error, and full error page on mobile and desktop in both themes, compared with the pre-refactor UI.
- Keyboard focus, tab order, form submission, and result-link interaction remain usable and unchanged. Long displayed URLs wrap without horizontal page overflow; inputs and error stacks may scroll within their own boundaries.
- Unit tests cover the controller, view, Button, TextInput, Card, and InlineError; `pnpm test`, `pnpm typecheck`, and `pnpm build` pass. Record browser-check outcomes and any unavailable checks; distinguish visual fixtures from real application behavior checks.
