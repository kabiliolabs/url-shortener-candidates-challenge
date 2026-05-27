# React Router Routes

## Why

The route modules currently access storage and generation logic directly. They should parse requests, call use cases and map results to HTTP or UI responses.

## How

Refactor route loaders/actions to consume server wiring and engine use cases. Keep route files thin and predictable.

Routes may depend on server wiring and engine use cases. They should not directly query the database or contain domain rules.

## Checklist

- [x] Refactor `_index.tsx` loader to load URL statistics.
- [x] Refactor `_index.tsx` action to create short URLs through the use case.
- [x] Map validation errors to form feedback.
- [x] Return meaningful action errors for invalid input and expected failures.
- [x] Build the public shortened URL in the web layer.
- [x] Refactor `s.$code.tsx` loader to resolve through the use case.
- [x] Increment click statistics during resolution.
- [x] Return a proper 404 for unknown codes.
- [x] Avoid leaking internal error details to the UI.
- [x] Remove direct imports of storage/generator internals from routes.
