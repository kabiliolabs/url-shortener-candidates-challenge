# 0003. Clicks are append-only records; counts are computed

Status: Accepted

## Context
Click statistics are required. A `clicks` counter on the short link would make every redirect update the same row.

## Decision
`ShortLink` does not hold clicks. Each redirect inserts a `Click` row (`short_code`, `occurred_at`). Counts are read through a dedicated read-model port (`ShortLinkStatsQuery`) that aggregates rows, indexed by `clicks.short_code`.

## Consequences
- Redirects never contend on a shared row lock.
- Raw events allow richer stats later (clicks over time, last click) without a migration of existing data.
- Counting grows with traffic; at scale, pre-aggregate or cache counts.
