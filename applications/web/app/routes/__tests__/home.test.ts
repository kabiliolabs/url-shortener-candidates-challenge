import { describe, it, expect, vi, beforeEach } from "vitest"
import { buildInMemoryRepo } from "../../core/__tests__/in-memory-repo.js"

// Mock the infra layer so tests never touch a real database.
const repo = buildInMemoryRepo()

vi.mock("../../infra/db.server.js", () => ({ db: {} }))
vi.mock("../../infra/repo.server.js", () => ({
  buildLinkRepository: () => repo,
}))

// Import AFTER mocking so the mocked modules are injected
const { loader, action } = await import("../home.js")

const BASE = "http://localhost:5173"

/** React Router's data() wraps the payload — unwrap for assertions */
function unwrap(response: unknown): Record<string, unknown> {
  const r = response as { type?: string; data?: Record<string, unknown> }
  return r?.type === "DataWithResponseInit" && r.data ? r.data : (response as Record<string, unknown>)
}

function makeRequest(method: "GET" | "POST", body?: Record<string, string>): Request {
  if (method === "GET") return new Request(BASE)
  const form = new FormData()
  if (body) Object.entries(body).forEach(([k, v]) => form.append(k, v))
  return new Request(BASE, { method: "POST", body: form })
}

const ctx = { params: {}, context: {} }

describe("home route", () => {
  beforeEach(() => {
    repo.clear()
  })

  // ── loader ─────────────────────────────────────────────────────────────────

  describe("loader", () => {
    it("returns recentLinks as an empty array when there are no links", async () => {
      const response = await loader({ request: makeRequest("GET"), ...ctx })
      expect(response.recentLinks).toEqual([])
    })

    it("returns the most recent links after some are created", async () => {
      await repo.create("aaaaaaa", "https://one.com")
      await repo.create("bbbbbbb", "https://two.com")

      const response = await loader({ request: makeRequest("GET"), ...ctx })
      expect(response.recentLinks.length).toBeGreaterThan(0)
      expect(response.recentLinks[0].shortUrl).toContain("/go/")
    })
  })

  // ── action ─────────────────────────────────────────────────────────────────

  describe("action", () => {
    it("returns ok:true and a shortUrl for a valid URL", async () => {
      const raw = await action({ request: makeRequest("POST", { url: "https://example.com" }), ...ctx })
      const body = unwrap(raw)

      expect(body.ok).toBe(true)
      expect(body.shortUrl as string).toContain("/go/")
      expect(body.isNew).toBe(true)
    })

    it("returns ok:true and isNew:false when the same URL is submitted twice", async () => {
      await action({ request: makeRequest("POST", { url: "https://dup.com" }), ...ctx })
      const raw = await action({ request: makeRequest("POST", { url: "https://dup.com" }), ...ctx })
      const body = unwrap(raw)

      expect(body.ok).toBe(true)
      expect(body.isNew).toBe(false)
    })

    it("returns ok:false and an error message for an empty URL", async () => {
      const raw = await action({ request: makeRequest("POST", { url: "" }), ...ctx })
      const body = unwrap(raw)

      expect(body.ok).toBe(false)
      expect(body.error).toBeTruthy()
    })

    it("returns ok:false for an invalid URL format", async () => {
      const raw = await action({ request: makeRequest("POST", { url: "not-a-url" }), ...ctx })
      const body = unwrap(raw)

      expect(body.ok).toBe(false)
      expect(body.error as string).toMatch(/valid url/i)
    })
  })
})
