# Submission

## What I Did

### Problems found in the initial codebase

- **Code generator:** alphabet `"abc"` and length 2 give only 9 possible codes. It never checks for collisions (a new URL can overwrite an existing one) and uses `Math.random()`, which is predictable.
- **Storage:** a globally exported, mutable `Map`. Data is lost on restart and anything can write to it.
- **No domain model:** a URL is a bare string in a `Map`, with no click count or timestamps.
- **Config:** `PUBLIC_URL` is read at import time with no validation. If it's missing, the action returns `"undefined/s/xx"`.
- **No validation:** the action only checks that the field is non-empty. The redirect route sends users to whatever string was stored, including `javascript:` and `data:` URLs.
- **Separation of concerns:** routes talk directly to the storage `Map`, with no service or repository layer.
- **Missing:** click statistics, a list view, loading states, error handling, tests, and persistence.
- **UI:** intentionally chaotic, with no reusable components.

---

### Work done
- Added `UrlShortenerService` (shorten, resolve, list) depending only on repository and generator interfaces.
- Validation with Zod and `URL`: http(s) only, length limit, blocks `javascript:` and `data:` URLs in the domain layer.
- Unit tests (Vitest) with an in-memory repository and a deterministic generator, covering collisions, invalid input and click counting.

## What I Would Do With More Time

<!-- What would you tackle next if you had more time? -->

## AI Usage

<!-- How did you use AI tools (if any)? Include some example prompts if you used any agent. -->

## Feedback

<!-- Any feedback on the challenge? Was it clear? Too easy/hard? Suggestions? -->
