# 0002. Short code uniqueness enforced by the primary key with retries

Status: Accepted

## Context
The original generator had 9 possible codes. Checking "does this code exist?" before inserting is racy under concurrent requests.

## Decision
Codes are 7 characters of base62 (~3.5 × 10¹² combinations) from `crypto.randomInt`. The code is the primary key of `short_links`. `ShortenUrl` inserts directly; the repository maps a unique violation to `ShortCodeAlreadyExistsError` and the use case retries with a new code, up to 5 attempts, then throws `ShortCodeGenerationExhaustedError`.

## Consequences
- Race-free: the database is the single source of truth for uniqueness.
- One round trip in the common case instead of check-then-insert.
- Codes are random, not sequential, so they cannot be enumerated by incrementing.
