# Tasks

## 1. Design system setup

- [x] 1.1 Add shadcn/ui with the Radix primitives needed (Button, Input, Card, Alert, Table) on top of the existing Tailwind v4 setup, with consistent design tokens, and verify `pnpm build` succeeds with the components rendering in a smoke test
- [x] 1.2 Add `react-hook-form` and `@hookform/resolvers`, and verify `pnpm typecheck` passes

## 2. Shorten form

- [x] 2.1 Rebuild the shorten form with `react-hook-form` and a Zod resolver that wraps the shared `assertShortenable` domain predicate from `libs/engine/src/domain` via `.superRefine()` (not the backend's infrastructure-layer Zod schema), replacing the current ad hoc markup, and verify a component test asserts an invalid URL shows an inline error without navigating away
- [x] 2.2 Wire React Router's navigation state to disable the submit button and show a loading indicator while the request is pending, and verify a component test asserts the button is disabled during submission
- [x] 2.3 Implement the API client layer mapping backend structured error responses (validation errors, 429 with `Retry-After`, network failures) to user-friendly messages, and verify unit tests cover each mapped case

## 3. Result and copy-to-clipboard

- [x] 3.1 Build the result card showing the shortened URL, an "open" link, and a copy-to-clipboard control with visible confirmation feedback, and verify a component test simulates the copy action and asserts the confirmation appears

## 4. URL listing view

- [x] 4.1 Add the API client call to `GET /api/urls`, and verify a unit test covers both the success and error response shapes
- [x] 4.2 Build the list/table view (original URL truncated with full value on hover, short URL, clicks, created date) with loading, empty, and error states, and verify component tests cover all three states plus the populated state

## 5. Accessibility and responsiveness

- [x] 5.1 Add labels for all form fields, visible focus styles for interactive elements, and an `aria-live` region announcing validation/result/error state changes, and verify an accessibility check (e.g. axe or a documented manual pass) finds no critical violations on the main page
- [x] 5.2 Verify the layout is usable at common breakpoints (mobile, tablet, desktop) by checking the page in the browser at each width

## 6. End-to-end verification

- [x] 6.1 Run the full test suite and `docker compose up --build`, and verify in the browser: shortening a URL with inline validation, seeing the loading state, copying the result, and viewing the stats list with real data
