# Tasks

## 1. Code generator

- [x] 1.1 Implement `Base62CodeGenerator` (`CodeGenerator`) using `crypto.randomInt`/`crypto.getRandomValues` to produce 7-character codes, and verify a unit test checks output against `^[A-Za-z0-9]{7}$` across many generated values
- [x] 1.2 Update the `refactor-backend-architecture` characterization tests that assumed the old 2-character code format, and verify they pass against the new 7-character Base62 format

## 2. Collision detection and retry

- [x] 2.1 Add an existence check to `UrlRepository` (e.g. `exists(code): Promise<boolean>`) and implement it in `InMemoryUrlRepository`, and verify a unit test covers both existing and non-existing codes
- [x] 2.2 Implement the retry loop in the `shortenUrl` use case (generate, check existence, retry up to 5 attempts), and verify a unit test using a fake `CodeGenerator` that returns a colliding code N times (N < 5) before a free one, asserting `shortenUrl` succeeds after retrying
- [x] 2.3 Add the exhausted-retry failure path, and verify a unit test using a fake `CodeGenerator` that collides on all 5 attempts, asserting `shortenUrl` throws `CodeGenerationError` and no existing `UrlRepository` entry is modified

## 3. Wiring and verification

- [x] 3.1 Wire `Base62CodeGenerator` into `composition-root.ts` in place of the wrapped legacy generator, and verify `pnpm typecheck` and `pnpm build` succeed
- [x] 3.2 Run the full test suite and `docker compose up --build`, and verify shortening a URL through the browser produces a 7-character code and the link still redirects correctly
