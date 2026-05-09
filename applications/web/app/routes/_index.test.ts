// @vitest-environment node
import { describe, it, expect } from "vitest";
import { loader, action } from "./_index";

describe("_index route", () => {
  describe("loader", () => {
    it("returns baseUrl with /s/ suffix", () => {
      const result = loader();
      expect(result).toHaveProperty("baseUrl");
      expect(result.baseUrl).toContain("/s/");
    });
  });

  describe("action", () => {
    it("returns error when URL is missing", async () => {
      const formData = new FormData();
      const request = new Request("http://localhost/", {
        method: "POST",
        body: formData,
      });

      const result = await action({
        request,
        params: {},
        context: {} as never,
        url: new URL(request.url),
        pattern: "/",
      } as any);
      expect(result).toEqual({ error: "URL is required" });
    });

    it("returns shortenedUrl for valid input", async () => {
      const formData = new FormData();
      formData.set("url", "https://example.com");
      const request = new Request("http://localhost/", {
        method: "POST",
        body: formData,
      });

      const result = await action({
        request,
        params: {},
        context: {} as never,
        url: new URL(request.url),
        pattern: "/",
      } as any);
      expect(result).toHaveProperty("shortenedUrl");
      expect(result.shortenedUrl).toContain("/s/");
    });
  });
});
