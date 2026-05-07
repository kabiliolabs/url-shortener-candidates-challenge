import { Effect } from "effect"
import { describe, it, expect, beforeEach } from "vitest"
import { makeLinksQuery } from "../queries/links.js"
import { buildInMemoryRepo } from "./in-memory-repo.js"

const BASE = "http://localhost:5173"

describe("makeLinksQuery", () => {
  let repo: ReturnType<typeof buildInMemoryRepo>

  beforeEach(async () => {
    repo = buildInMemoryRepo()
    // Pre-seed with two links
    await repo.create("abc1234", "https://alpha.com")
    await repo.create("xyz5678", "https://beta.com")
  })

  // ── resolveAndTrack ────────────────────────────────────────────────────────

  describe("resolveAndTrack", () => {
    it("returns the original URL and increments click count", async () => {
      const query = makeLinksQuery(repo)
      const url = await Effect.runPromise(query.resolveAndTrack("abc1234"))

      expect(url).toBe("https://alpha.com")

      const record = await repo.findByCode("abc1234")
      expect(record?.clickCount).toBe(1)
    })

    it("fails with LinkNotFoundError for an unknown code", async () => {
      const query = makeLinksQuery(repo)
      const result = await Effect.runPromise(
        query.resolveAndTrack("unknown").pipe(Effect.either),
      )

      expect(result._tag).toBe("Left")
      if (result._tag === "Left") {
        expect(result.left._tag).toBe("LinkNotFoundError")
      }
    })

    it("fails with LinkNotFoundError for a code with invalid format", async () => {
      const query = makeLinksQuery(repo)
      // isValidCode rejects codes that are not exactly 7 alphanumeric chars
      const result = await Effect.runPromise(
        query.resolveAndTrack("!!BAD!!").pipe(Effect.either),
      )

      expect(result._tag).toBe("Left")
      if (result._tag === "Left") {
        expect(result.left._tag).toBe("LinkNotFoundError")
      }
    })

    it("increments click count on each visit", async () => {
      const query = makeLinksQuery(repo)

      await Effect.runPromise(query.resolveAndTrack("abc1234"))
      await Effect.runPromise(query.resolveAndTrack("abc1234"))
      await Effect.runPromise(query.resolveAndTrack("abc1234"))

      const record = await repo.findByCode("abc1234")
      expect(record?.clickCount).toBe(3)
    })
  })

  // ── listRecent ─────────────────────────────────────────────────────────────

  describe("listRecent", () => {
    it("returns the most recently created links up to the limit", async () => {
      const query = makeLinksQuery(repo)
      const links = await Effect.runPromise(query.listRecent(1, BASE))

      expect(links).toHaveLength(1)
    })

    it("returns fully formed LinkDto with shortUrl", async () => {
      const query = makeLinksQuery(repo)
      const [link] = await Effect.runPromise(query.listRecent(2, BASE))

      expect(link.shortUrl).toBe(`${BASE}/go/${link.code}`)
      expect(link.originalUrl).toBeDefined()
      expect(link.clickCount).toBe(0)
    })

    it("returns an empty array when the repo is empty", async () => {
      const emptyRepo = buildInMemoryRepo()
      const query = makeLinksQuery(emptyRepo)
      const links = await Effect.runPromise(query.listRecent(3, BASE))

      expect(links).toEqual([])
    })
  })

  // ── listAll ────────────────────────────────────────────────────────────────

  describe("listAll", () => {
    it("returns all links", async () => {
      const query = makeLinksQuery(repo)
      const links = await Effect.runPromise(query.listAll(BASE))

      expect(links).toHaveLength(2)
    })

    it("returns an empty array when the repo is empty", async () => {
      const emptyRepo = buildInMemoryRepo()
      const query = makeLinksQuery(emptyRepo)
      const links = await Effect.runPromise(query.listAll(BASE))

      expect(links).toEqual([])
    })
  })
})
