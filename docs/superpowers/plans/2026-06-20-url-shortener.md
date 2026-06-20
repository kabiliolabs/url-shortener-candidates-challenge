# URL Shortener Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the flawed URL shortener into a clean, tested, persistent, secure full-stack app that runs on Docker.

**Architecture:** `libs/engine` holds the pure domain (short-code generation, URL validation, anti-SSRF, the `UrlShortener` service, and the `UrlRepository` port). `applications/web` is the React Router v7 app: it implements the port with Prisma/Postgres in `app/.server/`, wires everything in a composition root, and exposes routes + a shadcn/ui frontend. Dependency direction is one-way `web → engine`; the domain never imports Prisma, React Router, or reads `process.env`.

**Tech Stack:** pnpm + Turbo monorepo, React Router v7 (SSR), TypeScript (strict), Tailwind CSS v4, shadcn/ui (Radix + cva), Prisma + Postgres, Zod, Vitest.

## Global Constraints

- Node `20`, pnpm `10.20.0` (corepack), TypeScript `strict` mode.
- React Router `7.12.0`, Tailwind `^4.1.13` — keep existing versions.
- `libs/engine` must stay infra-free: no `@prisma/client`, no `react-router`, no `process.env` reads. Config is injected from the web layer.
- Short code: random base62, default length `7`, crypto-secure RNG, retry on collision, default `maxRetries = 5`.
- URL validation: max length `2048`, protocols `http`/`https` only.
- All domain logic that has branches gets a Vitest unit test (TDD). Web/UI/Docker tasks are verified by typecheck/build + manual smoke (no E2E per spec).
- **Commits are user-driven (Fabio dictates what and when).** Treat every "Commit" step as a checkpoint: stop and ask for the go-ahead with a proposed message; do not auto-commit. Commit message author/co-author must NOT mention Claude.

---

## File Structure

**`libs/engine`**
- `src/domain/short-code.ts` — `generateShortCode()` crypto-secure base62.
- `src/domain/url-validation.ts` — `validateAndNormalizeUrl()` (Zod) + anti-SSRF host check.
- `src/domain/errors.ts` — `InvalidUrlError`, `CodeCollisionError`, `RetryExhaustedError`.
- `src/ports/url-repository.ts` — `UrlRepository` interface + DTO types.
- `src/services/url-shortener.ts` — `UrlShortener` service.
- `src/index.ts` — barrel exports.
- `src/**/*.test.ts` — Vitest unit tests.
- `vitest.config.ts`, `package.json` (add zod, vitest).

**`applications/web`**
- `prisma/schema.prisma` — `ShortenedUrl`, `Click`.
- `prisma/migrations/**` — initial migration.
- `app/.server/db.ts` — Prisma client singleton.
- `app/.server/url-repository.prisma.ts` — `PrismaUrlRepository`.
- `app/.server/rate-limit.ts` — in-memory token bucket.
- `app/.server/container.ts` — composition root.
- `app/.server/security-headers.ts` — shared headers map.
- `app/lib/utils.ts` — `cn()`.
- `app/components/ui/{button,input,label,card,alert}.tsx` — shadcn/ui primitives.
- `app/components/url-form.tsx`, `app/components/url-list.tsx`.
- `app/routes/_index.tsx`, `app/routes/s.$code.tsx`.
- `app/entry.server.tsx` — security headers.
- `app/root.tsx` — restyled layout + ErrorBoundary.
- `app/app.css` — shadcn theme tokens.
- `Dockerfile`, `docker-compose.yml`, `docker-entrypoint.sh`, `.env.example`, `README.md`, `CHALLENGE_SUBMISSION.md`.

---

## Task 1: Vitest + Zod setup in engine

**Files:**
- Modify: `libs/engine/package.json`
- Create: `libs/engine/vitest.config.ts`
- Modify: `turbo.json`
- Create: `libs/engine/src/domain/sanity.test.ts` (temporary)

**Interfaces:**
- Produces: a working `pnpm --filter @url-shortener/engine test` command.

- [ ] **Step 1: Add deps and test script to `libs/engine/package.json`**

Add `zod` to `dependencies` and `vitest` to `devDependencies`, and a `test` script:

```json
{
  "name": "@url-shortener/engine",
  "version": "0.0.1",
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist tsconfig.tsbuildinfo .turbo",
    "dev": "tsc --watch",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/node": "^22.19.7",
    "typescript": "^5.9.3",
    "vitest": "^3.0.5"
  }
}
```

- [ ] **Step 2: Create `libs/engine/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Add a `test` task to `turbo.json`**

Add inside `"tasks"`:

```json
    "test": {
      "dependsOn": ["^build"]
    },
```

- [ ] **Step 4: Add a temporary sanity test `libs/engine/src/domain/sanity.test.ts`**

```ts
import { describe, expect, it } from "vitest";

describe("sanity", () => {
  it("runs vitest", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Install and run**

Run: `pnpm install` then `pnpm --filter @url-shortener/engine test`
Expected: 1 passing test.

- [ ] **Step 6: Delete the sanity test**

Run: `rm libs/engine/src/domain/sanity.test.ts`

- [ ] **Step 7: Commit** (checkpoint — ask user)

```bash
git add libs/engine/package.json libs/engine/vitest.config.ts turbo.json pnpm-lock.yaml
git commit -m "chore(engine): set up vitest and zod"
```

---

## Task 2: Short code generator

**Files:**
- Create: `libs/engine/src/domain/short-code.ts`
- Test: `libs/engine/src/domain/short-code.test.ts`

**Interfaces:**
- Produces: `generateShortCode(options?: { length?: number; alphabet?: string; randomBytes?: (size: number) => Uint8Array }): string`. Default length 7, base62 alphabet, crypto RNG, no modulo bias (rejection sampling).

- [ ] **Step 1: Write the failing test `libs/engine/src/domain/short-code.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { generateShortCode } from "./short-code";

describe("generateShortCode", () => {
  it("returns a code of the requested length", () => {
    expect(generateShortCode({ length: 7 })).toHaveLength(7);
    expect(generateShortCode({ length: 10 })).toHaveLength(10);
  });

  it("defaults to length 7", () => {
    expect(generateShortCode()).toHaveLength(7);
  });

  it("only uses characters from the base62 alphabet", () => {
    const code = generateShortCode({ length: 100 });
    expect(code).toMatch(/^[0-9A-Za-z]+$/);
  });

  it("uses the injected randomness deterministically", () => {
    // bytes 0,1,2 -> first three alphabet chars: 0,1,2
    const randomBytes = (size: number) =>
      Uint8Array.from({ length: size }, (_, i) => i);
    expect(generateShortCode({ length: 3, randomBytes })).toBe("012");
  });

  it("avoids modulo bias by rejecting out-of-range bytes", () => {
    // alphabet length 62; bytes >= 248 (4*62) would bias -> must be skipped.
    // Provide 250 (rejected), then 0 -> first char should be alphabet[0] = "0".
    const queue = [250, 0];
    let idx = 0;
    const randomBytes = (size: number) =>
      Uint8Array.from({ length: size }, () => queue[idx++ % queue.length]);
    expect(generateShortCode({ length: 1, randomBytes })).toBe("0");
  });

  it("produces distinct codes across many calls", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 1000; i++) seen.add(generateShortCode());
    expect(seen.size).toBe(1000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @url-shortener/engine test`
Expected: FAIL — `generateShortCode` not found.

- [ ] **Step 3: Implement `libs/engine/src/domain/short-code.ts`**

```ts
const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export interface GenerateShortCodeOptions {
  length?: number;
  alphabet?: string;
  /** Injectable RNG for tests. Defaults to crypto-secure bytes. */
  randomBytes?: (size: number) => Uint8Array;
}

function defaultRandomBytes(size: number): Uint8Array {
  const bytes = new Uint8Array(size);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * Generates a random short code using rejection sampling to avoid modulo bias.
 * Crypto-secure by default; pass `randomBytes` to make it deterministic in tests.
 */
export function generateShortCode(options: GenerateShortCodeOptions = {}): string {
  const length = options.length ?? 7;
  const alphabet = options.alphabet ?? BASE62;
  const randomBytes = options.randomBytes ?? defaultRandomBytes;
  const max = Math.floor(256 / alphabet.length) * alphabet.length;

  let code = "";
  while (code.length < length) {
    const bytes = randomBytes(length - code.length);
    for (const byte of bytes) {
      if (byte >= max) continue; // reject to avoid bias
      code += alphabet[byte % alphabet.length];
      if (code.length === length) break;
    }
  }
  return code;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @url-shortener/engine test`
Expected: PASS (all `generateShortCode` tests).

- [ ] **Step 5: Commit** (checkpoint — ask user)

```bash
git add libs/engine/src/domain/short-code.ts libs/engine/src/domain/short-code.test.ts
git commit -m "feat(engine): crypto-secure base62 short code generator"
```

---

## Task 3: Domain errors

**Files:**
- Create: `libs/engine/src/domain/errors.ts`

**Interfaces:**
- Produces: `InvalidUrlError`, `CodeCollisionError`, `RetryExhaustedError` classes.

- [ ] **Step 1: Implement `libs/engine/src/domain/errors.ts`** (no test — trivial data classes, covered transitively by service/validation tests)

```ts
export class InvalidUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidUrlError";
  }
}

export class CodeCollisionError extends Error {
  constructor(public readonly code: string) {
    super(`Short code already exists: ${code}`);
    this.name = "CodeCollisionError";
  }
}

export class RetryExhaustedError extends Error {
  constructor(public readonly attempts: number) {
    super(`Could not generate a unique short code after ${attempts} attempts`);
    this.name = "RetryExhaustedError";
  }
}
```

- [ ] **Step 2: Commit** (checkpoint — ask user)

```bash
git add libs/engine/src/domain/errors.ts
git commit -m "feat(engine): typed domain errors"
```

---

## Task 4: URL validation + anti-SSRF

**Files:**
- Create: `libs/engine/src/domain/url-validation.ts`
- Test: `libs/engine/src/domain/url-validation.test.ts`

**Interfaces:**
- Consumes: `InvalidUrlError` from `./errors`.
- Produces: `validateAndNormalizeUrl(raw: string): string` — throws `InvalidUrlError` on bad input; returns the normalized href. `isPrivateHost(hostname: string): boolean`.

- [ ] **Step 1: Write the failing test `libs/engine/src/domain/url-validation.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { validateAndNormalizeUrl, isPrivateHost } from "./url-validation";
import { InvalidUrlError } from "./errors";

describe("validateAndNormalizeUrl", () => {
  it("accepts and normalizes a valid https url", () => {
    expect(validateAndNormalizeUrl("https://example.com/path?q=1")).toBe(
      "https://example.com/path?q=1",
    );
  });

  it("accepts http", () => {
    expect(validateAndNormalizeUrl("http://example.com")).toBe(
      "http://example.com/",
    );
  });

  it("trims surrounding whitespace", () => {
    expect(validateAndNormalizeUrl("  https://example.com  ")).toBe(
      "https://example.com/",
    );
  });

  it("rejects empty input", () => {
    expect(() => validateAndNormalizeUrl("")).toThrow(InvalidUrlError);
  });

  it("rejects non-http(s) schemes", () => {
    expect(() => validateAndNormalizeUrl("javascript:alert(1)")).toThrow(
      InvalidUrlError,
    );
    expect(() => validateAndNormalizeUrl("data:text/html,x")).toThrow(
      InvalidUrlError,
    );
    expect(() => validateAndNormalizeUrl("ftp://example.com")).toThrow(
      InvalidUrlError,
    );
  });

  it("rejects malformed urls", () => {
    expect(() => validateAndNormalizeUrl("not a url")).toThrow(InvalidUrlError);
  });

  it("rejects urls over 2048 chars", () => {
    const long = "https://example.com/" + "a".repeat(2048);
    expect(() => validateAndNormalizeUrl(long)).toThrow(InvalidUrlError);
  });

  it("rejects private / internal hosts (anti-SSRF)", () => {
    for (const u of [
      "http://localhost",
      "http://127.0.0.1",
      "http://10.0.0.5",
      "http://172.16.0.1",
      "http://192.168.1.1",
      "http://169.254.169.254",
      "http://[::1]",
    ]) {
      expect(() => validateAndNormalizeUrl(u)).toThrow(InvalidUrlError);
    }
  });
});

describe("isPrivateHost", () => {
  it("flags loopback and private ranges", () => {
    expect(isPrivateHost("localhost")).toBe(true);
    expect(isPrivateHost("127.0.0.1")).toBe(true);
    expect(isPrivateHost("10.1.2.3")).toBe(true);
    expect(isPrivateHost("192.168.0.1")).toBe(true);
    expect(isPrivateHost("::1")).toBe(true);
  });

  it("allows public hosts", () => {
    expect(isPrivateHost("example.com")).toBe(false);
    expect(isPrivateHost("8.8.8.8")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @url-shortener/engine test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `libs/engine/src/domain/url-validation.ts`**

```ts
import { z } from "zod";
import { InvalidUrlError } from "./errors";

const MAX_URL_LENGTH = 2048;
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

const rawUrlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .max(MAX_URL_LENGTH, `URL must be at most ${MAX_URL_LENGTH} characters`);

/** Returns true for loopback, link-local, and RFC1918 private hosts. */
export function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, ""); // strip IPv6 brackets

  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host === "::1" || host.startsWith("fc") || host.startsWith("fd")) return true;

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = ipv4.slice(1).map(Number);
    if (a === 127) return true; // loopback
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 169 && b === 254) return true; // link-local
    if (a === 0) return true;
  }
  return false;
}

/**
 * Validates and normalizes a user-supplied URL.
 * Note: anti-SSRF only blocks literal private IPs / localhost; it does not
 * resolve DNS, so a public hostname pointing to a private IP is not caught.
 */
export function validateAndNormalizeUrl(raw: string): string {
  const parsed = rawUrlSchema.safeParse(raw);
  if (!parsed.success) {
    throw new InvalidUrlError(parsed.error.issues[0]?.message ?? "Invalid URL");
  }

  let url: URL;
  try {
    url = new URL(parsed.data);
  } catch {
    throw new InvalidUrlError("Please enter a valid URL");
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    throw new InvalidUrlError("Only http and https URLs are allowed");
  }
  if (isPrivateHost(url.hostname)) {
    throw new InvalidUrlError("URLs pointing to private or internal hosts are not allowed");
  }

  return url.href;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @url-shortener/engine test`
Expected: PASS.

- [ ] **Step 5: Commit** (checkpoint — ask user)

```bash
git add libs/engine/src/domain/url-validation.ts libs/engine/src/domain/url-validation.test.ts
git commit -m "feat(engine): strict URL validation with anti-SSRF host checks"
```

---

## Task 5: Repository port

**Files:**
- Create: `libs/engine/src/ports/url-repository.ts`

**Interfaces:**
- Produces: `ShortenedUrl`, `ShortenedUrlWithStats`, `ClickMeta`, `UrlRepository`. `create` throws `CodeCollisionError` on duplicate `code`.

- [ ] **Step 1: Implement `libs/engine/src/ports/url-repository.ts`** (interface only — no test)

```ts
export interface ShortenedUrl {
  id: string;
  code: string;
  originalUrl: string;
  createdAt: Date;
}

export interface ShortenedUrlWithStats extends ShortenedUrl {
  clickCount: number;
  lastClickedAt: Date | null;
}

export interface ClickMeta {
  referer?: string | null;
  userAgent?: string | null;
}

export interface UrlRepository {
  /** Persists a new short URL. MUST throw CodeCollisionError if `code` already exists. */
  create(data: { code: string; originalUrl: string }): Promise<ShortenedUrl>;
  findByCode(code: string): Promise<ShortenedUrl | null>;
  list(): Promise<ShortenedUrlWithStats[]>;
  recordClick(urlId: string, meta: ClickMeta): Promise<void>;
}
```

- [ ] **Step 2: Commit** (checkpoint — ask user)

```bash
git add libs/engine/src/ports/url-repository.ts
git commit -m "feat(engine): define UrlRepository port"
```

---

## Task 6: UrlShortener service

**Files:**
- Create: `libs/engine/src/services/url-shortener.ts`
- Test: `libs/engine/src/services/url-shortener.test.ts`

**Interfaces:**
- Consumes: `UrlRepository`, `ShortenedUrl` from `../ports/url-repository`; `generateShortCode` from `../domain/short-code`; `validateAndNormalizeUrl` from `../domain/url-validation`; `CodeCollisionError`, `RetryExhaustedError` from `../domain/errors`.
- Produces: `class UrlShortener` with `constructor(repo: UrlRepository, options?: UrlShortenerOptions)` and `shorten(rawUrl: string): Promise<ShortenedUrl>`. `UrlShortenerOptions = { codeLength?: number; maxRetries?: number; generateCode?: () => string }`.

- [ ] **Step 1: Write the failing test `libs/engine/src/services/url-shortener.test.ts`**

```ts
import { describe, expect, it, vi } from "vitest";
import { UrlShortener } from "./url-shortener";
import { CodeCollisionError, RetryExhaustedError, InvalidUrlError } from "../domain/errors";
import type { UrlRepository, ShortenedUrl, ShortenedUrlWithStats, ClickMeta } from "../ports/url-repository";

class FakeUrlRepository implements UrlRepository {
  private byCode = new Map<string, ShortenedUrl>();
  public createCalls: string[] = [];

  async create(data: { code: string; originalUrl: string }): Promise<ShortenedUrl> {
    this.createCalls.push(data.code);
    if (this.byCode.has(data.code)) throw new CodeCollisionError(data.code);
    const row: ShortenedUrl = {
      id: `id-${this.byCode.size + 1}`,
      code: data.code,
      originalUrl: data.originalUrl,
      createdAt: new Date(0),
    };
    this.byCode.set(data.code, row);
    return row;
  }
  async findByCode(code: string) {
    return this.byCode.get(code) ?? null;
  }
  async list(): Promise<ShortenedUrlWithStats[]> {
    return [];
  }
  async recordClick(_urlId: string, _meta: ClickMeta) {}
}

describe("UrlShortener", () => {
  it("validates the URL and persists a normalized version", async () => {
    const repo = new FakeUrlRepository();
    const service = new UrlShortener(repo, { generateCode: () => "abc123X" });
    const result = await service.shorten("  https://example.com  ");
    expect(result.code).toBe("abc123X");
    expect(result.originalUrl).toBe("https://example.com/");
  });

  it("throws InvalidUrlError for bad input without touching the repo", async () => {
    const repo = new FakeUrlRepository();
    const service = new UrlShortener(repo);
    await expect(service.shorten("javascript:alert(1)")).rejects.toBeInstanceOf(InvalidUrlError);
    expect(repo.createCalls).toHaveLength(0);
  });

  it("retries on collision until it finds a free code", async () => {
    const repo = new FakeUrlRepository();
    await repo.create({ code: "taken01", originalUrl: "https://a.com/" });
    const codes = ["taken01", "free007"];
    let i = 0;
    const service = new UrlShortener(repo, { generateCode: () => codes[i++] });
    const result = await service.shorten("https://example.com");
    expect(result.code).toBe("free007");
    expect(repo.createCalls).toEqual(["taken01", "taken01", "free007"]);
  });

  it("throws RetryExhaustedError after maxRetries collisions", async () => {
    const repo = new FakeUrlRepository();
    await repo.create({ code: "dup", originalUrl: "https://a.com/" });
    const service = new UrlShortener(repo, { maxRetries: 3, generateCode: () => "dup" });
    await expect(service.shorten("https://example.com")).rejects.toBeInstanceOf(RetryExhaustedError);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @url-shortener/engine test`
Expected: FAIL — `UrlShortener` not found.

- [ ] **Step 3: Implement `libs/engine/src/services/url-shortener.ts`**

```ts
import { generateShortCode } from "../domain/short-code";
import { validateAndNormalizeUrl } from "../domain/url-validation";
import { CodeCollisionError, RetryExhaustedError } from "../domain/errors";
import type { ShortenedUrl, UrlRepository } from "../ports/url-repository";

export interface UrlShortenerOptions {
  codeLength?: number;
  maxRetries?: number;
  /** Override code generation (used in tests). */
  generateCode?: () => string;
}

export class UrlShortener {
  private readonly maxRetries: number;
  private readonly generateCode: () => string;

  constructor(
    private readonly repo: UrlRepository,
    options: UrlShortenerOptions = {},
  ) {
    const codeLength = options.codeLength ?? 7;
    this.maxRetries = options.maxRetries ?? 5;
    this.generateCode =
      options.generateCode ?? (() => generateShortCode({ length: codeLength }));
  }

  async shorten(rawUrl: string): Promise<ShortenedUrl> {
    const originalUrl = validateAndNormalizeUrl(rawUrl);

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const code = this.generateCode();
      try {
        return await this.repo.create({ code, originalUrl });
      } catch (error) {
        if (error instanceof CodeCollisionError) continue;
        throw error;
      }
    }
    throw new RetryExhaustedError(this.maxRetries);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @url-shortener/engine test`
Expected: PASS.

- [ ] **Step 5: Commit** (checkpoint — ask user)

```bash
git add libs/engine/src/services/url-shortener.ts libs/engine/src/services/url-shortener.test.ts
git commit -m "feat(engine): UrlShortener service with collision retry"
```

---

## Task 7: Engine barrel exports

**Files:**
- Modify: `libs/engine/src/index.ts`
- Delete: `libs/engine/src/base-url.ts`, `libs/engine/src/shortened-url.ts`

**Interfaces:**
- Produces: public API of `@url-shortener/engine`.

- [ ] **Step 1: Replace `libs/engine/src/index.ts`**

```ts
export { generateShortCode } from "./domain/short-code";
export type { GenerateShortCodeOptions } from "./domain/short-code";
export { validateAndNormalizeUrl, isPrivateHost } from "./domain/url-validation";
export { InvalidUrlError, CodeCollisionError, RetryExhaustedError } from "./domain/errors";
export type {
  UrlRepository,
  ShortenedUrl,
  ShortenedUrlWithStats,
  ClickMeta,
} from "./ports/url-repository";
export { UrlShortener } from "./services/url-shortener";
export type { UrlShortenerOptions } from "./services/url-shortener";
```

- [ ] **Step 2: Remove the obsolete in-memory files**

Run: `rm libs/engine/src/base-url.ts libs/engine/src/shortened-url.ts`

- [ ] **Step 3: Typecheck the engine**

Run: `pnpm --filter @url-shortener/engine typecheck`
Expected: no errors. (The web app still imports the old symbols — that's fixed in later tasks; typecheck the engine in isolation here.)

- [ ] **Step 4: Run engine tests**

Run: `pnpm --filter @url-shortener/engine test`
Expected: PASS.

- [ ] **Step 5: Commit** (checkpoint — ask user)

```bash
git add libs/engine/src/index.ts
git rm libs/engine/src/base-url.ts libs/engine/src/shortened-url.ts
git commit -m "refactor(engine): export new domain API, drop in-memory store"
```

---

## Task 8: Prisma schema + client + Postgres dep

**Files:**
- Modify: `applications/web/package.json` (add `@prisma/client`, `prisma`)
- Create: `applications/web/prisma/schema.prisma`
- Create: `applications/web/app/.server/db.ts`
- Modify: `.env.example` (and create local `.env`)

**Interfaces:**
- Produces: generated Prisma client; `prisma` singleton from `app/.server/db.ts`.

- [ ] **Step 1: Add deps + prisma scripts to `applications/web/package.json`**

Add to `dependencies`: `"@prisma/client": "^6.3.1"`. Add to `devDependencies`: `"prisma": "^6.3.1"`. Add scripts:

```json
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy"
```

- [ ] **Step 2: Create `applications/web/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model ShortenedUrl {
  id          String   @id @default(cuid())
  code        String   @unique
  originalUrl String
  createdAt   DateTime @default(now())
  clicks      Click[]

  @@map("shortened_urls")
}

model Click {
  id        String       @id @default(cuid())
  urlId     String
  url       ShortenedUrl @relation(fields: [urlId], references: [id], onDelete: Cascade)
  createdAt DateTime     @default(now())
  referer   String?
  userAgent String?

  @@index([urlId])
  @@map("clicks")
}
```

- [ ] **Step 3: Create `applications/web/app/.server/db.ts`**

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 4: Update `.env.example`**

```
PUBLIC_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/url_shortener?schema=public
```

(For local dev outside Docker, run a local Postgres or point `DATABASE_URL` at the compose DB on `localhost:5432`.)

- [ ] **Step 5: Install + generate client**

Run: `pnpm install` then `pnpm --filter web prisma:generate`
Expected: "Generated Prisma Client".

- [ ] **Step 6: Commit** (checkpoint — ask user)

```bash
git add applications/web/package.json applications/web/prisma/schema.prisma applications/web/app/.server/db.ts .env.example pnpm-lock.yaml
git commit -m "feat(web): add prisma schema, postgres datasource, client singleton"
```

---

## Task 9: PrismaUrlRepository

**Files:**
- Create: `applications/web/app/.server/url-repository.prisma.ts`

**Interfaces:**
- Consumes: `prisma` from `./db`; `UrlRepository`, `ShortenedUrl`, `ShortenedUrlWithStats`, `ClickMeta`, `CodeCollisionError` from `@url-shortener/engine`.
- Produces: `class PrismaUrlRepository implements UrlRepository`. Translates Prisma `P2002` into `CodeCollisionError`.

- [ ] **Step 1: Implement `applications/web/app/.server/url-repository.prisma.ts`**

```ts
import { Prisma } from "@prisma/client";
import {
  CodeCollisionError,
  type ClickMeta,
  type ShortenedUrl,
  type ShortenedUrlWithStats,
  type UrlRepository,
} from "@url-shortener/engine";
import { prisma } from "./db";

export class PrismaUrlRepository implements UrlRepository {
  async create(data: { code: string; originalUrl: string }): Promise<ShortenedUrl> {
    try {
      const row = await prisma.shortenedUrl.create({ data });
      return this.toEntity(row);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new CodeCollisionError(data.code);
      }
      throw error;
    }
  }

  async findByCode(code: string): Promise<ShortenedUrl | null> {
    const row = await prisma.shortenedUrl.findUnique({ where: { code } });
    return row ? this.toEntity(row) : null;
  }

  async list(): Promise<ShortenedUrlWithStats[]> {
    const rows = await prisma.shortenedUrl.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { clicks: true } },
        clicks: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
      },
    });
    return rows.map((row) => ({
      ...this.toEntity(row),
      clickCount: row._count.clicks,
      lastClickedAt: row.clicks[0]?.createdAt ?? null,
    }));
  }

  async recordClick(urlId: string, meta: ClickMeta): Promise<void> {
    await prisma.click.create({
      data: {
        urlId,
        referer: meta.referer ?? null,
        userAgent: meta.userAgent ?? null,
      },
    });
  }

  private toEntity(row: {
    id: string;
    code: string;
    originalUrl: string;
    createdAt: Date;
  }): ShortenedUrl {
    return {
      id: row.id,
      code: row.code,
      originalUrl: row.originalUrl,
      createdAt: row.createdAt,
    };
  }
}
```

- [ ] **Step 2: Commit** (checkpoint — ask user)

```bash
git add applications/web/app/.server/url-repository.prisma.ts
git commit -m "feat(web): Prisma implementation of UrlRepository"
```

---

## Task 10: Composition root

**Files:**
- Create: `applications/web/app/.server/container.ts`

**Interfaces:**
- Consumes: `PrismaUrlRepository`, `UrlShortener`.
- Produces: `getUrlShortener(): UrlShortener`, `getUrlRepository(): UrlRepository`, `getPublicBaseUrl(): string`, `buildShortUrl(code: string): string`.

- [ ] **Step 1: Implement `applications/web/app/.server/container.ts`**

```ts
import { UrlShortener, type UrlRepository } from "@url-shortener/engine";
import { PrismaUrlRepository } from "./url-repository.prisma";

const repository: UrlRepository = new PrismaUrlRepository();
const shortener = new UrlShortener(repository, { codeLength: 7, maxRetries: 5 });

export function getUrlRepository(): UrlRepository {
  return repository;
}

export function getUrlShortener(): UrlShortener {
  return shortener;
}

export function getPublicBaseUrl(): string {
  return (process.env.PUBLIC_URL ?? "http://localhost:5173").replace(/\/$/, "");
}

export function buildShortUrl(code: string): string {
  return `${getPublicBaseUrl()}/s/${code}`;
}
```

- [ ] **Step 2: Commit** (checkpoint — ask user)

```bash
git add applications/web/app/.server/container.ts
git commit -m "feat(web): composition root wiring repo + shortener + base url"
```

---

## Task 11: Rate limiter

**Files:**
- Create: `applications/web/app/.server/rate-limit.ts`

**Interfaces:**
- Produces: `checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds: number }`. Default 10 tokens, refill 1 token / 6s (≈10/min).

- [ ] **Step 1: Implement `applications/web/app/.server/rate-limit.ts`**

```ts
interface Bucket {
  tokens: number;
  lastRefill: number;
}

const CAPACITY = 10;
const REFILL_INTERVAL_MS = 6_000; // 1 token every 6s ≈ 10/min sustained

const buckets = new Map<string, Bucket>();

/**
 * In-memory token bucket. Per-instance only (not shared across replicas) —
 * acceptable for this challenge; a production system would use Redis.
 */
export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: CAPACITY, lastRefill: now };

  const elapsed = now - bucket.lastRefill;
  const refill = Math.floor(elapsed / REFILL_INTERVAL_MS);
  if (refill > 0) {
    bucket.tokens = Math.min(CAPACITY, bucket.tokens + refill);
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) {
    buckets.set(key, bucket);
    return { allowed: false, retryAfterSeconds: Math.ceil(REFILL_INTERVAL_MS / 1000) };
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Extracts the best-effort client IP from a request. */
export function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
```

- [ ] **Step 2: Commit** (checkpoint — ask user)

```bash
git add applications/web/app/.server/rate-limit.ts
git commit -m "feat(web): in-memory token-bucket rate limiter"
```

---

## Task 12: shadcn/ui foundation (theme + cn + primitives)

**Files:**
- Modify: `applications/web/package.json` (add UI deps)
- Create: `applications/web/app/lib/utils.ts`
- Modify: `applications/web/app/app.css`
- Create: `applications/web/app/components/ui/button.tsx`
- Create: `applications/web/app/components/ui/input.tsx`
- Create: `applications/web/app/components/ui/label.tsx`
- Create: `applications/web/app/components/ui/card.tsx`
- Create: `applications/web/app/components/ui/alert.tsx`

**Interfaces:**
- Produces: `cn()`, `<Button>`, `<Input>`, `<Label>`, `<Card>/<CardHeader>/<CardTitle>/<CardDescription>/<CardContent>/<CardFooter>`, `<Alert>/<AlertTitle>/<AlertDescription>`.

- [ ] **Step 1: Add UI deps to `applications/web/package.json` dependencies**

```json
    "@radix-ui/react-label": "^2.1.1",
    "@radix-ui/react-slot": "^1.1.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.474.0",
    "tailwind-merge": "^2.6.0"
```

Run: `pnpm install`

- [ ] **Step 2: Create `applications/web/app/lib/utils.ts`**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: Replace `applications/web/app/app.css` with shadcn theme tokens (Tailwind v4)**

```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(222.2 47.4% 11.2%);
  --color-card: hsl(0 0% 100%);
  --color-card-foreground: hsl(222.2 47.4% 11.2%);
  --color-primary: hsl(222.2 47.4% 11.2%);
  --color-primary-foreground: hsl(210 40% 98%);
  --color-muted: hsl(210 40% 96.1%);
  --color-muted-foreground: hsl(215.4 16.3% 46.9%);
  --color-border: hsl(214.3 31.8% 91.4%);
  --color-input: hsl(214.3 31.8% 91.4%);
  --color-ring: hsl(222.2 47.4% 11.2%);
  --color-destructive: hsl(0 84.2% 60.2%);
  --color-destructive-foreground: hsl(210 40% 98%);
  --radius: 0.625rem;
}

@layer base {
  * {
    border-color: var(--color-border);
  }
  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
  }
}
```

- [ ] **Step 4: Create `applications/web/app/components/ui/button.tsx`**

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90",
        outline: "border border-[var(--color-input)] bg-transparent hover:bg-[var(--color-muted)]",
        ghost: "hover:bg-[var(--color-muted)]",
        destructive: "bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] hover:opacity-90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
  },
);
Button.displayName = "Button";

export { buttonVariants };
```

- [ ] **Step 5: Create `applications/web/app/components/ui/input.tsx`**

```tsx
import * as React from "react";
import { cn } from "~/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-[var(--color-input)] bg-transparent px-3 py-2 text-sm placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-[var(--color-destructive)] aria-[invalid=true]:ring-[var(--color-destructive)]",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
```

- [ ] **Step 6: Create `applications/web/app/components/ui/label.tsx`**

```tsx
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "~/lib/utils";

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn("text-sm font-medium leading-none peer-disabled:opacity-70", className)}
    {...props}
  />
));
Label.displayName = "Label";
```

- [ ] **Step 7: Create `applications/web/app/components/ui/card.tsx`**

```tsx
import * as React from "react";
import { cn } from "~/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-card-foreground)] shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />;
}
export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-[var(--color-muted-foreground)]", className)} {...props} />;
}
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />;
}
```

- [ ] **Step 8: Create `applications/web/app/components/ui/alert.tsx`**

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const alertVariants = cva("relative w-full rounded-lg border p-4 text-sm", {
  variants: {
    variant: {
      default: "bg-[var(--color-card)] text-[var(--color-card-foreground)]",
      destructive:
        "border-[var(--color-destructive)] text-[var(--color-destructive)] bg-[color-mix(in_srgb,var(--color-destructive)_8%,transparent)]",
      success: "border-green-600 text-green-700 bg-green-50",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Alert({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>) {
  return <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}
export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />;
}
export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <div className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />;
}
```

- [ ] **Step 9: Typecheck**

Run: `pnpm --filter web typecheck`
Expected: no errors (note: `_index.tsx` still references old engine API — that's replaced in Task 14; if typecheck fails only there, proceed).

- [ ] **Step 10: Commit** (checkpoint — ask user)

```bash
git add applications/web/package.json applications/web/app/lib/utils.ts applications/web/app/app.css applications/web/app/components/ui pnpm-lock.yaml
git commit -m "feat(web): add shadcn/ui foundation (theme, cn, primitives)"
```

---

## Task 13: App components (UrlForm, UrlList)

**Files:**
- Create: `applications/web/app/components/url-form.tsx`
- Create: `applications/web/app/components/url-list.tsx`

**Interfaces:**
- Consumes: ui primitives; `useNavigation`, `Form` from `react-router`.
- Produces: `<UrlForm error?: string />`, `<UrlList urls={...} />`. `UrlListItem = { code: string; originalUrl: string; shortUrl: string; clickCount: number; lastClickedAt: string | null; createdAt: string }`.

- [ ] **Step 1: Create `applications/web/app/components/url-form.tsx`**

```tsx
import { Form, useNavigation } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function UrlForm({ error }: { error?: string }) {
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === "submitting" && navigation.formMethod === "POST";

  return (
    <Form method="post" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="url">URL to shorten</Label>
        <div className="flex gap-2">
          <Input
            id="url"
            name="url"
            type="url"
            inputMode="url"
            placeholder="https://example.com/very/long/link"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "url-error" : undefined}
            required
            disabled={isSubmitting}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Shortening…" : "Shorten"}
          </Button>
        </div>
        {error && (
          <p id="url-error" className="text-sm text-[var(--color-destructive)]">
            {error}
          </p>
        )}
      </div>
    </Form>
  );
}
```

- [ ] **Step 2: Create `applications/web/app/components/url-list.tsx`**

```tsx
import { useState } from "react";
import { Button } from "./ui/button";

export interface UrlListItem {
  code: string;
  originalUrl: string;
  shortUrl: string;
  clickCount: number;
  lastClickedAt: string | null;
  createdAt: string;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

export function UrlList({ urls }: { urls: UrlListItem[] }) {
  if (urls.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted-foreground)] py-8 text-center">
        No links yet. Shorten your first URL above.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-muted-foreground)]">
            <th className="py-2 pr-4 font-medium">Short link</th>
            <th className="py-2 pr-4 font-medium">Original</th>
            <th className="py-2 pr-4 font-medium text-right">Clicks</th>
            <th className="py-2 pr-4 font-medium">Last click</th>
            <th className="py-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {urls.map((u) => (
            <tr key={u.code} className="border-b border-[var(--color-border)] last:border-0">
              <td className="py-3 pr-4">
                <a
                  href={u.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[var(--color-primary)] underline-offset-4 hover:underline"
                >
                  /s/{u.code}
                </a>
              </td>
              <td className="py-3 pr-4 max-w-[22rem] truncate text-[var(--color-muted-foreground)]" title={u.originalUrl}>
                {u.originalUrl}
              </td>
              <td className="py-3 pr-4 text-right tabular-nums">{u.clickCount}</td>
              <td className="py-3 pr-4 text-[var(--color-muted-foreground)]">
                {u.lastClickedAt ? new Date(u.lastClickedAt).toLocaleString() : "—"}
              </td>
              <td className="py-3 text-right">
                <CopyButton value={u.shortUrl} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Commit** (checkpoint — ask user)

```bash
git add applications/web/app/components/url-form.tsx applications/web/app/components/url-list.tsx
git commit -m "feat(web): UrlForm and UrlList components"
```

---

## Task 14: Index route (create + list)

**Files:**
- Modify: `applications/web/app/routes/_index.tsx` (full rewrite)

**Interfaces:**
- Consumes: `getUrlShortener`, `getUrlRepository`, `buildShortUrl`, `getPublicBaseUrl` from `~/.server/container`; `checkRateLimit`, `getClientIp` from `~/.server/rate-limit`; `InvalidUrlError`, `RetryExhaustedError` from `@url-shortener/engine`; `UrlForm`, `UrlList`, ui primitives.

- [ ] **Step 1: Rewrite `applications/web/app/routes/_index.tsx`**

```tsx
import { data, useActionData, useLoaderData } from "react-router";
import type { Route } from "./+types/_index";
import { InvalidUrlError, RetryExhaustedError } from "@url-shortener/engine";
import {
  buildShortUrl,
  getPublicBaseUrl,
  getUrlRepository,
  getUrlShortener,
} from "~/.server/container";
import { checkRateLimit, getClientIp } from "~/.server/rate-limit";
import { UrlForm } from "~/components/url-form";
import { UrlList, type UrlListItem } from "~/components/url-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "~/components/ui/alert";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and track clicks" },
  ];
}

export async function loader(_: Route.LoaderArgs) {
  const urls = await getUrlRepository().list();
  const items: UrlListItem[] = urls.map((u) => ({
    code: u.code,
    originalUrl: u.originalUrl,
    shortUrl: buildShortUrl(u.code),
    clickCount: u.clickCount,
    lastClickedAt: u.lastClickedAt ? u.lastClickedAt.toISOString() : null,
    createdAt: u.createdAt.toISOString(),
  }));
  return { urls: items, baseUrl: getPublicBaseUrl() };
}

export async function action({ request }: Route.ActionArgs) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return data(
      { error: `Too many requests. Try again in ${limit.retryAfterSeconds}s.` },
      { status: 429 },
    );
  }

  const formData = await request.formData();
  const url = String(formData.get("url") ?? "");

  try {
    const created = await getUrlShortener().shorten(url);
    return { shortUrl: buildShortUrl(created.code), code: created.code };
  } catch (error) {
    if (error instanceof InvalidUrlError) {
      return data({ error: error.message }, { status: 400 });
    }
    if (error instanceof RetryExhaustedError) {
      return data(
        { error: "Could not generate a unique code. Please try again." },
        { status: 503 },
      );
    }
    console.error("Failed to shorten URL", error);
    return data({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export default function Index() {
  const { urls, baseUrl } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const shortUrl = actionData && "shortUrl" in actionData ? actionData.shortUrl : undefined;
  const error = actionData && "error" in actionData ? actionData.error : undefined;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">URL Shortener</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Paste a long URL to get a short link. Links start with {baseUrl}/s/
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Shorten a URL</CardTitle>
          <CardDescription>Only http and https links are allowed.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <UrlForm error={error} />
          {shortUrl && (
            <Alert variant="success">
              <AlertTitle>Your short link is ready</AlertTitle>
              <AlertDescription>
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono underline underline-offset-4 break-all"
                >
                  {shortUrl}
                </a>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your links</CardTitle>
          <CardDescription>{urls.length} link(s), with click statistics.</CardDescription>
        </CardHeader>
        <CardContent>
          <UrlList urls={urls} />
        </CardContent>
      </Card>
    </main>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter web typecheck`
Expected: no errors.

- [ ] **Step 3: Commit** (checkpoint — ask user)

```bash
git add applications/web/app/routes/_index.tsx
git commit -m "feat(web): redesign index route with create form, results, and stats list"
```

---

## Task 15: Redirect route + click tracking

**Files:**
- Modify: `applications/web/app/routes/s.$code.tsx` (full rewrite)

**Interfaces:**
- Consumes: `getUrlRepository` from `~/.server/container`.

- [ ] **Step 1: Rewrite `applications/web/app/routes/s.$code.tsx`**

```tsx
import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { getUrlRepository } from "~/.server/container";

export async function loader({ params, request }: Route.LoaderArgs) {
  const { code } = params;
  const repo = getUrlRepository();
  const target = await repo.findByCode(code);

  if (!target) {
    throw new Response("Short link not found", { status: 404 });
  }

  // Record the click but never let a stats failure block the redirect.
  try {
    await repo.recordClick(target.id, {
      referer: request.headers.get("referer"),
      userAgent: request.headers.get("user-agent"),
    });
  } catch (error) {
    console.error("Failed to record click", error);
  }

  return redirect(target.originalUrl);
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter web typecheck`
Expected: no errors.

- [ ] **Step 3: Commit** (checkpoint — ask user)

```bash
git add applications/web/app/routes/s.$code.tsx
git commit -m "feat(web): record click stats on redirect"
```

---

## Task 16: Security headers + restyled root/ErrorBoundary

**Files:**
- Create: `applications/web/app/.server/security-headers.ts`
- Create: `applications/web/app/entry.server.tsx`
- Modify: `applications/web/app/root.tsx` (ErrorBoundary restyle)

**Interfaces:**
- Produces: `SECURITY_HEADERS` record; entry server applies them.

- [ ] **Step 1: Create `applications/web/app/.server/security-headers.ts`**

```ts
export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy":
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; base-uri 'self'; frame-ancestors 'none'",
};
```

- [ ] **Step 2: Create `applications/web/app/entry.server.tsx`** (standard RR v7 entry + header injection)

```tsx
import { PassThrough } from "node:stream";
import type { EntryContext } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { SECURITY_HEADERS } from "~/.server/security-headers";

export const streamTimeout = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const userAgent = request.headers.get("user-agent");
    const readyOption =
      userAgent && isbot(userAgent) ? "onAllReady" : "onShellReady";

    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
            responseHeaders.set(key, value);
          }
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );
          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          if (shellRendered) console.error(error);
        },
      },
    );

    setTimeout(abort, streamTimeout + 1000);
  });
}
```

- [ ] **Step 3: Restyle `ErrorBoundary` in `applications/web/app/root.tsx`**

Replace the `ErrorBoundary` function body's returned JSX with clean styling (keep the existing logic that computes `message`/`details`/`stack`):

```tsx
  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center flex flex-col gap-3">
      <h1 className="text-4xl font-semibold tracking-tight">{message}</h1>
      <p className="text-[var(--color-muted-foreground)]">{details}</p>
      <a href="/" className="text-[var(--color-primary)] underline underline-offset-4">
        Back to home
      </a>
      {stack && (
        <pre className="mt-4 w-full overflow-x-auto rounded-md bg-[var(--color-muted)] p-4 text-left text-xs">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
```

- [ ] **Step 4: Typecheck + build**

Run: `pnpm --filter web typecheck`
Expected: no errors.
Run: `pnpm --filter web build`
Expected: build succeeds (this also confirms `entry.server.tsx` is valid).

- [ ] **Step 5: Commit** (checkpoint — ask user)

```bash
git add applications/web/app/.server/security-headers.ts applications/web/app/entry.server.tsx applications/web/app/root.tsx
git commit -m "feat(web): security headers and restyled error boundary"
```

---

## Task 17: Initial Prisma migration

**Files:**
- Create: `applications/web/prisma/migrations/**`

**Interfaces:**
- Produces: committed SQL migration for `migrate deploy`.

- [ ] **Step 1: Start a local Postgres for migration generation**

Run: `docker run --name us-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=url_shortener -p 5432:5432 -d postgres:16-alpine`
(If Docker images can't be pulled in this environment, skip to the fallback note below.)

- [ ] **Step 2: Generate the initial migration**

Run: `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/url_shortener?schema=public" pnpm --filter web exec prisma migrate dev --name init`
Expected: creates `applications/web/prisma/migrations/<timestamp>_init/migration.sql` and applies it.

**Fallback** (if no local Postgres available): instead of committing migrations, the entrypoint will use `prisma db push` (Task 18 documents both). In that case skip committing a migrations folder.

- [ ] **Step 3: Stop the throwaway DB**

Run: `docker rm -f us-pg`

- [ ] **Step 4: Commit** (checkpoint — ask user)

```bash
git add applications/web/prisma/migrations
git commit -m "feat(web): initial prisma migration"
```

---

## Task 18: Docker — compose, Dockerfile, entrypoint

**Files:**
- Modify: `docker-compose.yml`
- Modify: `Dockerfile`
- Create: `docker-entrypoint.sh`

**Interfaces:**
- Produces: `docker-compose up --build` serving the app on `http://localhost:3000` against a Postgres service.

- [ ] **Step 1: Rewrite `docker-compose.yml`**

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: url_shortener
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d url_shortener"]
      interval: 5s
      timeout: 5s
      retries: 10

  web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PUBLIC_URL: http://localhost:3000
      DATABASE_URL: postgresql://postgres:postgres@db:5432/url_shortener?schema=public
    depends_on:
      db:
        condition: service_healthy

volumes:
  pgdata:
```

- [ ] **Step 2: Create `docker-entrypoint.sh`**

```sh
#!/bin/sh
set -e

# Apply migrations if present, otherwise sync schema directly.
if [ -d ./prisma/migrations ] && [ "$(ls -A ./prisma/migrations 2>/dev/null)" ]; then
  echo "Running prisma migrate deploy…"
  pnpm exec prisma migrate deploy
else
  echo "No migrations found; running prisma db push…"
  pnpm exec prisma db push --skip-generate
fi

exec pnpm start
```

- [ ] **Step 3: Rewrite `Dockerfile`** (add prisma generate in build; entrypoint runs migrations)

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate
WORKDIR /app

FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY libs/engine/package.json ./libs/engine/
COPY applications/web/package.json ./applications/web/
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/libs/engine/node_modules ./libs/engine/node_modules
COPY --from=dependencies /app/applications/web/node_modules ./applications/web/node_modules
COPY . .
RUN pnpm --filter web exec prisma generate
RUN pnpm build

FROM base AS production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/applications/web/node_modules ./applications/web/node_modules
COPY --from=build /app/libs/engine/node_modules ./libs/engine/node_modules
COPY --from=build /app/applications/web/build ./applications/web/build
COPY --from=build /app/applications/web/prisma ./applications/web/prisma
COPY libs/engine/src ./libs/engine/src
COPY applications/web/package.json ./applications/web/
COPY libs/engine/package.json ./libs/engine/
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY docker-entrypoint.sh ./applications/web/docker-entrypoint.sh
RUN chmod +x ./applications/web/docker-entrypoint.sh

WORKDIR /app/applications/web
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
```

- [ ] **Step 4: Verify the build + run**

Run: `docker compose up --build -d`
Then: `docker compose logs -f web` (expect migration output then "serving").
Then in a browser / curl: `curl -I http://localhost:3000` → expect `200` and security headers present.
Smoke test: open `http://localhost:3000`, shorten a URL, click the short link (redirects), reload home (click count increments). Restart: `docker compose restart web` → data persists.
Tear down: `docker compose down` (keep volume) — data should survive `up` again.

- [ ] **Step 5: Commit** (checkpoint — ask user)

```bash
git add docker-compose.yml Dockerfile docker-entrypoint.sh
git commit -m "feat: dockerize with postgres service and migration entrypoint"
```

---

## Task 19: Docs — README + submission

**Files:**
- Modify: `README.md`
- Modify: `CHALLENGE_SUBMISSION.md`

**Interfaces:** none.

- [ ] **Step 1: Update `README.md`**

Update the "Tech Stack" tree to include `libs/engine` domain + `prisma`, add Postgres/Prisma/Zod/shadcn rows to the table, and update Local + Docker setup. Local setup must mention starting Postgres (or `docker compose up db`), copying `.env`, running `pnpm --filter web prisma:generate` and `prisma migrate dev`, then `pnpm dev`. Docker section: `docker compose up --build` → `http://localhost:3000`; note data persists in the `pgdata` volume.

- [ ] **Step 2: Fill `CHALLENGE_SUBMISSION.md`**

Write the four sections honestly:
- **What I Did**: domain extraction into `libs/engine` (SOLID, repository port, DIP), crypto-secure base62 codes with collision retry, Prisma+Postgres persistence, click time-series stats, shadcn/ui redesign, robust error handling + loading states, security (strict validation, anti-SSRF, rate limiting, security headers), Vitest unit tests on the domain, Dockerized with Postgres. Prioritized clean architecture + correctness + security because they show the most signal.
- **What I Would Do With More Time**: integration tests for the Prisma repo, E2E happy-path, shared rate limiting (Redis), DNS-resolution anti-SSRF, per-link stats detail page with a chart, link expiration / custom codes, pagination on the list.
- **AI Usage**: used Claude Code with a brainstorm → spec → plan → TDD workflow; include 2-3 example prompts.
- **Feedback**: brief notes on the challenge.

- [ ] **Step 3: Commit** (checkpoint — ask user)

```bash
git add README.md CHALLENGE_SUBMISSION.md
git commit -m "docs: update README and fill challenge submission"
```

---

## Task 20: Full verification sweep

**Files:** none (verification only).

- [ ] **Step 1: Lint/typecheck/test/build across the monorepo**

Run: `pnpm install`
Run: `pnpm --filter @url-shortener/engine test` → all pass.
Run: `pnpm typecheck` → no errors.
Run: `pnpm build` → succeeds.

- [ ] **Step 2: Docker end-to-end**

Run: `docker compose down -v` then `docker compose up --build`.
Verify: home loads (clean UI), create a link, redirect works, click count increments, list shows stats, restart preserves data, invalid URL shows inline error, `javascript:`/private-host URLs rejected, rapid repeated submits eventually return 429.

- [ ] **Step 3: Final commit if anything changed** (checkpoint — ask user)

---

## Self-Review (filled by plan author)

**Spec coverage:**
- Clean modern UI + reusable components → Tasks 12-14, 16.
- URL input form with error feedback → Tasks 13-14.
- List view with statistics → Tasks 9, 13-14.
- Robust error handling + loading states → Tasks 13-15.
- DB persistence survives restart + repository pattern + Prisma → Tasks 5, 8-10, 17-18.
- Security (validation, anti-SSRF, rate limit, headers) → Tasks 4, 11, 14, 16.
- SOLID / clean architecture → Tasks 1-10 (engine purity + DIP).
- Input validation → Task 4.
- Testing of important parts → Tasks 1-6 (Vitest on domain).
- Docker → Tasks 18, 20. README + submission → Task 19.

**Placeholder scan:** No TBD/TODO; all code steps include full code. Task 19 docs steps describe content to write (acceptable — prose deliverables), not code placeholders.

**Type consistency:** `UrlRepository` signatures (`create`/`findByCode`/`list`/`recordClick`) consistent across Tasks 5, 6, 9, 14, 15. `ShortenedUrlWithStats` fields (`clickCount`, `lastClickedAt`) consistent in Tasks 5, 9, 14. `generateShortCode` options consistent in Tasks 2, 6. `UrlShortener` constructor `(repo, options)` consistent in Tasks 6, 10.
