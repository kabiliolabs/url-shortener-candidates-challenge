// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import { loader } from "./s.$code";

vi.mock("~/server/services/url.service.server", () => ({
  resolveShortCode: vi.fn((code: string) => {
    if (code === "abc123") {
      return Promise.resolve({
        id: 1,
        shortCode: "abc123",
        originalUrl: "https://example.com",
        createdAt: new Date(),
      });
    }
    return Promise.resolve(null);
  }),
}));

vi.mock("~/server/repositories/index.server", () => ({
  urlRepository: {},
  clickRepository: {
    recordClick: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock("~/server/lib/logger.server", () => ({
  logger: { error: vi.fn() },
}));

describe("s.$code route", () => {
  it("redirects to original URL for valid code", async () => {
    const request = new Request("http://localhost/s/abc123");
    const response = await loader({
      params: { code: "abc123" },
      request,
      context: {} as never,
      url: new URL(request.url),
      pattern: "/s/:code",
    } as any);

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("https://example.com");
  });

  it("throws 404 for unknown code", async () => {
    const request = new Request("http://localhost/s/nonexistent");
    await expect(
      loader({
        params: { code: "nonexistent" },
        request,
        context: {} as never,
        url: new URL(request.url),
        pattern: "/s/:code",
      } as any)
    ).rejects.toBeInstanceOf(Response);

    try {
      await loader({
        params: { code: "nonexistent" },
        request,
        context: {} as never,
        url: new URL(request.url),
        pattern: "/s/:code",
      } as any);
      expect.fail("Expected loader to throw");
    } catch (e) {
      expect(e).toBeInstanceOf(Response);
      expect((e as Response).status).toBe(404);
    }
  });
});
