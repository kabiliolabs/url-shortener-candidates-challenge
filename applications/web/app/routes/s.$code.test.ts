// @vitest-environment node
import { describe, it, expect } from "vitest";
import { loader } from "./s.$code";
import { createShortUrl } from "~/server/services/url-shortener.service";

describe("s.$code route", () => {
  it("redirects to original URL for valid code", () => {
    const { shortCode } = createShortUrl("https://example.com");

    const request = new Request("http://localhost/s/" + shortCode);
    const response = loader({
      params: { code: shortCode },
      request,
      context: {} as never,
      url: new URL(request.url),
      pattern: "/s/:code",
    } as any);

    expect(response).toBeInstanceOf(Response);
    expect((response as Response).status).toBe(302);
    expect((response as Response).headers.get("Location")).toBe(
      "https://example.com"
    );
  });

  it("throws 404 for unknown code", () => {
    try {
      const request = new Request("http://localhost/s/nonexistent");
      loader({
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
