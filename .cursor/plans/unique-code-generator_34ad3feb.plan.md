---
name: unique-code-generator
overview: Make short-code creation collision-safe by expanding the generator space and adding retry-on-conflict in the create flow, with integration-first tests that prove duplicate codes are never silently reused.
todos:
  - id: expand-code-space
    content: Replace the tiny short-code alphabet/length in the engine and update engine tests for the new shape.
    status: completed
  - id: retry-on-collision
    content: Refactor the create flow to retry code generation on duplicate-code conflicts and fail cleanly after a bounded number of attempts.
    status: completed
  - id: integration-tests
    content: Add collision-focused integration tests in the web app, including a route-level success case after an initial collision.
    status: completed
  - id: submission-notes
    content: Update CHALLENGE_SUBMISSION.md with the uniqueness strategy and its tradeoffs.
    status: completed
isProject: false
---

# Improve Unique Code Generation

## Proposed approach

Use a two-layer safety model:

- Keep the existing database uniqueness guarantee in `[applications/web/prisma/schema.prisma](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/prisma/schema.prisma)`.
- Make collisions rare by replacing the tiny `"abc"` / length `2` generator in `[libs/engine/src/shortened-url.ts](/Users/gemma/code/url-shortener-candidates-challenge/libs/engine/src/shortened-url.ts)` with a much larger alphabet and length.
- Make collisions non-fatal by changing `[createShortenedUrl()` in `applications/web/app/domain/url-shortener.server.ts](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/app/domain/url-shortener.server.ts)` from a single-attempt insert to a bounded retry loop that regenerates a code when the repository signals a duplicate-code conflict.

Essential current behavior to replace:

```33:43:applications/web/app/domain/url-shortener.server.ts
export async function createShortenedUrl(
  url: string,
  { currentBaseUrl, createCode, repository }: ShortenUrlDependencies,
): Promise<{ shortenedUrl: string }> {
  const shortCode = createCode();

  await repository.create({ code: shortCode, originalUrl: url });

  return {
    shortenedUrl: `${currentBaseUrl}/s/${shortCode}`,
  };
}
```

Current generator space is only 9 codes:

```1:9:libs/engine/src/shortened-url.ts
export function generateShortCode(): string {
  const chars = "abc";
  const length = 2;
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
```

## Planned changes

1. Update `[libs/engine/src/shortened-url.ts](/Users/gemma/code/url-shortener-candidates-challenge/libs/engine/src/shortened-url.ts)`

- Replace the tiny alphabet/length with a significantly larger space, ideally base62-like and nanoid-style length.
- Keep the generator API simple (`generateShortCode(): string`) so the web app wiring stays stable.
- Update `[libs/engine/tests/shortened-url.test.ts](/Users/gemma/code/url-shortener-candidates-challenge/libs/engine/tests/shortened-url.test.ts)` to assert the new length and allowed character set instead of `[abc]{2}`.

1. Add collision-aware creation in `[applications/web/app/domain/url-shortener.server.ts](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/app/domain/url-shortener.server.ts)`

- Introduce a bounded retry loop around `repository.create(...)`.
- Treat duplicate-code errors as retryable; rethrow non-collision errors immediately.
- If all attempts fail, return a controlled failure instead of silently reusing a taken code.
- Keep the repository uniqueness constraint as the correctness boundary for concurrent requests.

1. Handle duplicate-code detection in persistence/test repositories

- In `[applications/web/app/infrastructure/prisma-shortened-url.repository.server.ts](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/app/infrastructure/prisma-shortened-url.repository.server.ts)`, add a small adapter/helper that recognizes Prisma unique-constraint errors for `code`.
- In `[applications/web/tests/helpers/in-memory-repository.ts](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/tests/helpers/in-memory-repository.ts)`, keep throwing on duplicate create so tests can exercise the retry path deterministically.
- If needed for clean architecture, expose a small shared collision predicate/error type at the domain boundary rather than leaking Prisma details into domain logic.

1. Add integration-first tests

- Extend `[applications/web/tests/url-shortener.server.test.ts](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/tests/url-shortener.server.test.ts)` with collision scenarios using a deterministic `createCode` sequence and the in-memory repository:
  - first generated code already exists, second generated code succeeds
  - duplicate error retries instead of failing immediately
  - repeated collisions eventually surface a controlled error after max attempts
- Extend `[applications/web/tests/routes.integration.test.ts](/Users/gemma/code/url-shortener-candidates-challenge/applications/web/tests/routes.integration.test.ts)` so the route action is verified end-to-end with the default action flow and a mocked generator sequence, proving a user still gets a shortened URL when the first candidate collides.
- Keep engine tests focused and lightweight; put the heavier behavior assertions in the web app tests.

1. Document tradeoffs in `[CHALLENGE_SUBMISSION.md](/Users/gemma/code/url-shortener-candidates-challenge/CHALLENGE_SUBMISSION.md)`

- Record why the chosen approach uses a much larger random code space plus DB-backed retry instead of relying on randomness alone.
- Mention the bounded retry tradeoff and why the DB unique index remains the final source of truth.

## Tradeoffs to implement

- A larger random space reduces collision frequency, but it does not by itself guarantee uniqueness.
- Retrying on repository/DB duplicate errors closes that gap without requiring a schema redesign.
- This is lower-risk than switching to DB-generated codes right now, because it preserves current URL format expectations and package boundaries while still meeting the “no silent collisions” requirement.

