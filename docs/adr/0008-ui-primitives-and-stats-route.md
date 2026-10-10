# 0008. Hand-written UI primitives and stats on their own route

Status: Accepted

## Context
The UI needs reusable components, loading states, error feedback and a statistics view, while staying simple.

## Decision
- Four small primitives (`button`, `input`, `card`, `table`) written in the shadcn style with Tailwind, instead of the shadcn CLI and its dependencies.
- Routes load data and handle actions; components only render.
- The form uses `useFetcher` for loading state, inline errors and automatic revalidation.
- Statistics live on `/links`, loaded fresh on every visit, instead of a list on the home page that goes stale as clicks happen elsewhere.

## Consequences
- No extra runtime dependencies; full control over markup and accessibility.
- Adding complex components (dialogs, menus) would justify adopting Radix/shadcn.
