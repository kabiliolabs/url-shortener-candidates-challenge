import { Effect } from "effect"
import { describe, it, expect, beforeEach } from "vitest"
import { makeShortenCommand } from "../commands/shorten.js"
import { buildInMemoryRepo } from "./in-memory-repo.js"

// We need a fresh repo and command for each test to avoid state leaking
// between tests (rate limiter buckets are module-level, so we use a fresh
// client key per test to avoid cross-test collisions).
let clientKeyCounter = 0
function freshKey() {
  return `test-client-${++clientKeyCounter}`
}

describe("makeShortenCommand", () => {
  let repo: ReturnType<typeof buildInMemoryRepo>
  let shorten: ReturnType<typeof makeShortenCommand>

  beforeEach(() => {
    repo = buildInMemoryRepo()
    shorten = makeShortenCommand(repo)
  })

  // ── Success cases ──────────────────────────────────────────────────────────

  it("creates a new short link for a valid URL", async () => {
    const result = await Effect.runPromise(
      shorten("https://example.com", freshKey()),
    )

    expect(result.isNew).toBe(true)
    expect(result.link.originalUrl).toBe("https://example.com")
    expect(result.link.code).toHaveLength(7)
  })

  it("returns the existing link when the same URL is shortened twice", async () => {
    const key = freshKey()
    const first = await Effect.runPromise(shorten("https://example.com/dup", key))
    const second = await Effect.runPromise(shorten("https://example.com/dup", key))

    expect(first.isNew).toBe(true)
    expect(second.isNew).toBe(false)
    expect(second.link.id).toBe(first.link.id)
    expect(second.link.code).toBe(first.link.code)
  })

  it("creates different records for different URLs", async () => {
    const key = freshKey()
    const a = await Effect.runPromise(shorten("https://a.com", key))
    const b = await Effect.runPromise(shorten("https://b.com", key))

    expect(a.link.code).not.toBe(b.link.code)
    expect(a.link.id).not.toBe(b.link.id)
  })

  // ── Validation errors ──────────────────────────────────────────────────────

  it("fails with InvalidUrlError(empty) for an empty string", async () => {
    const result = await Effect.runPromise(
      shorten("", freshKey()).pipe(Effect.either),
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left._tag).toBe("InvalidUrlError")
      // @ts-expect-error — narrowing after tag check
      expect(result.left.reason).toBe("empty")
    }
  })

  it("fails with InvalidUrlError(empty) for a whitespace-only string", async () => {
    const result = await Effect.runPromise(
      shorten("   ", freshKey()).pipe(Effect.either),
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left._tag).toBe("InvalidUrlError")
    }
  })

  it("fails with InvalidUrlError(format) for a non-URL string", async () => {
    const result = await Effect.runPromise(
      shorten("not-a-url", freshKey()).pipe(Effect.either),
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left._tag).toBe("InvalidUrlError")
      // @ts-expect-error — narrowing after tag check
      expect(result.left.reason).toBe("format")
    }
  })

  it("fails with InvalidUrlError(format) for ftp:// protocol", async () => {
    const result = await Effect.runPromise(
      shorten("ftp://files.example.com", freshKey()).pipe(Effect.either),
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left._tag).toBe("InvalidUrlError")
    }
  })

  it("fails with InvalidUrlError(too_long) for a URL longer than 2048 chars", async () => {
    const longUrl = "https://example.com/" + "a".repeat(2050)
    const result = await Effect.runPromise(
      shorten(longUrl, freshKey()).pipe(Effect.either),
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left._tag).toBe("InvalidUrlError")
      // @ts-expect-error — narrowing after tag check
      expect(result.left.reason).toBe("too_long")
    }
  })

  // ── Rate limiting ──────────────────────────────────────────────────────────

  it("fails with RateLimitError after exceeding 10 requests per minute", async () => {
    const key = freshKey()

    // Exhaust the 10-request limit with different URLs
    for (let i = 0; i < 10; i++) {
      await Effect.runPromise(shorten(`https://example.com/page-${i}`, key))
    }

    const result = await Effect.runPromise(
      shorten("https://example.com/over-limit", key).pipe(Effect.either),
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left._tag).toBe("RateLimitError")
    }
  })

  it("does NOT rate-limit different client keys independently", async () => {
    const keyA = freshKey()
    const keyB = freshKey()

    // Exhaust keyA limit
    for (let i = 0; i < 10; i++) {
      await Effect.runPromise(shorten(`https://example-a.com/page-${i}`, keyA))
    }

    // keyB should still work
    const result = await Effect.runPromise(
      shorten("https://example-b.com/first", keyB),
    )

    expect(result.isNew).toBe(true)
  })
})
