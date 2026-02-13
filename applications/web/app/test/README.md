# Frontend Tests

This directory contains the test setup and utilities for the URL Shortener frontend.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm test -- --coverage
```

## Test Files

### Component Tests
- `CopyButton.test.tsx` - Tests clipboard functionality, success/error states, and accessibility
- `StatsCard.test.tsx` - Tests stat display and optional subtitle
- `_index.test.tsx` - Tests form submission, loading states, and error/success messages
- `dashboard.test.tsx` - Tests URL list display, stats calculations, and integrated components

## Test Setup

- **Framework**: Vitest
- **Testing Library**: React Testing Library
- **Environment**: jsdom
- **Setup File**: `setup.ts`

## Test Utilities

### `test-utils.tsx`
Custom render function for testing components that use React Router:

```tsx
import { renderWithRouter } from "~/test/test-utils";

renderWithRouter(<MyComponent />, {
  loaderData: { /* loader data */ },
  actionData: { /* action data */ },
});
```

## Coverage

Test coverage focuses on:
- User interactions (clicks, form submission)
- Accessibility (ARIA attributes, screen reader support)
- Error handling
- Loading states
- Component integration

## Mocks

The test setup includes mocks for:
- `navigator.clipboard.writeText` - Clipboard API
- `window.matchMedia` - Media query matching

Add additional mocks in `setup.ts` as needed.
