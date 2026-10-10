# 0004. A redirect never fails because click recording failed

Status: Accepted

## Context
Resolving a link and recording the click are two writes with different importance.

## Decision
`ResolveShortLink` returns the destination even if saving the `Click` fails. The failure is logged with the error and short code.

## Consequences
- Redirecting, the core purpose, has no dependency on analytics succeeding.
- A failed click is lost, not retried. Acceptable for statistics; would need an outbox or queue if counts became billing-critical.
