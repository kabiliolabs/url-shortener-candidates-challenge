---
name: Click Stats Feature Plan
overview: Implement a dedicated statistics page with shadcn-based UI that shows per-link click counts and a top-clicked ranking, while keeping current shortening/redirect behavior unchanged and adding integration-first tests.
todos:
  - id: add-stats-route
    content: Add dedicated stats route and wire it in app routes
    status: completed
  - id: stats-domain-read-model
    content: Add domain helper to produce stats view data (totals + top-clicked ranking + list)
    status: completed
  - id: stats-ui-shadcn
    content: Build shadcn-based stats page UI with summary, top links, and full list
    status: completed
  - id: stats-integration-tests
    content: Add/extend integration tests for stats route and click-count regression
    status: completed
isProject: false
---

# Click Stats Feature Plan

## Scope Locked

- Add a **dedicated stats page** (not inline on home).
- Add **Top clicked links** as the extra value feature.
- Keep existing shortening/redirect behavior unchanged.

## Implementation Steps

- Add a new route entry in `[applications/web/app/routes.ts](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/app/routes.ts)` for a stats page (e.g. `/stats`).
- Create stats loader in a new route module (e.g. `[applications/web/app/routes/stats.tsx](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/app/routes/stats.tsx)`) that reads links via existing domain/repository path (currently `list()` on `[ShortenedUrlRepository](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/app/domain/repositories/shortened-url.repository.ts)`).
- In domain layer, add a small read-model helper in `[applications/web/app/domain/url-shortener.server.ts](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/app/domain/url-shortener.server.ts)` to return:
  - all links for the table (latest-first or explicitly chosen order),
  - top clicked links (sorted by `clicks desc`, then stable tie-break).
- Build shadcn-style UI components for stats in `[applications/web/app/components/layout](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/app/components/layout)`, reusing existing primitives from `[applications/web/app/components/ui](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/app/components/ui)`:
  - summary cards (total links, total clicks),
  - top-clicked ranking card,
  - links table/list with code, original URL, clicks, created date.
- Add discoverability from home page (`_index`) with a clear CTA link/button to stats, without altering submit/redirect flow in `[applications/web/app/routes/_index.tsx](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/app/routes/_index.tsx)`.

## Testing Strategy (Integration-First)

- Add route integration tests for new stats loader/route in `[applications/web/tests](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/tests)`, using the in-memory repository mock pattern already used by existing route tests.
- Cover key behavior:
  - stats route returns empty state correctly,
  - stats route returns list data and top-clicked ranking order,
  - totals are computed correctly from stored records.
- Keep/extend short-code integration test to ensure click increment behavior remains intact after UI/domain additions (no regression on `[applications/web/app/routes/s.$code.tsx](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/app/routes/s.$code.tsx)`).
- Add a small pure-function unit test only if needed for non-trivial ranking/aggregation helper; otherwise avoid extra unit-test sprawl.

## UX Notes

- Prioritize fast scanning: summary at top, then top-clicked highlights, then full list.
- Include a clear empty state with guidance to create first short URL.
- Keep visual language consistent with current shadcn modernization work (cards, badges, separators, muted text hierarchy).

## Out of Scope (for this iteration)

- Click event history table/timeline analytics.
- Time-window trends (last 7 days/hourly charts).
- Additional persistence schema changes for analytics events.

