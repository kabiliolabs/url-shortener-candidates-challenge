import { describe, expect, it, vi } from "vitest";

import {
  buildShortenedUrlPrefix,
  createShortenedUrl,
  findShortenedUrl,
  getSubmittedUrl,
  handleShortenUrlAction,
} from "../app/domain/url-shortener.server";

describe("url shortener server utilities", () => {
  it("builds the shortened URL prefix when a base URL exists", () => {
    expect(buildShortenedUrlPrefix("http://test.example")).toBe(
      "http://test.example/s/",
    );
  });

  it("returns '-' when the base URL is missing", () => {
    expect(buildShortenedUrlPrefix(undefined)).toBe("-");
  });

  it("reads a submitted URL from form data", () => {
    const formData = new FormData();
    formData.set("url", "https://example.com/page");

    expect(getSubmittedUrl(formData)).toBe("https://example.com/page");
  });

  it("returns null when no URL was submitted", () => {
    expect(getSubmittedUrl(new FormData())).toBeNull();
  });

  it("stores the URL and builds a shortened URL", () => {
    const set = vi.fn();

    const result = createShortenedUrl("https://example.com/page", {
      currentBaseUrl: "http://test.example",
      createCode: () => "aa",
      store: { get: vi.fn(), set },
    });

    expect(set).toHaveBeenCalledWith("aa", "https://example.com/page");
    expect(result).toEqual({
      shortenedUrl: "http://test.example/s/aa",
    });
  });

  it("returns a validation error before generating a code", async () => {
    const createCode = vi.fn(() => "aa");
    const request = new Request("http://test.example/", {
      method: "POST",
      body: new FormData(),
    });

    const result = await handleShortenUrlAction(request, {
      currentBaseUrl: "http://test.example",
      createCode,
      store: { get: vi.fn(), set: vi.fn() },
    });

    expect(result).toEqual({ error: "URL is required" });
    expect(createCode).not.toHaveBeenCalled();
  });

  it("finds a stored shortened URL by code", () => {
    const store = new Map([["aa", "https://example.com/page"]]);

    expect(findShortenedUrl("aa", store)).toBe("https://example.com/page");
  });

  it("returns null when a code is missing or unknown", () => {
    const store = new Map([["aa", "https://example.com/page"]]);

    expect(findShortenedUrl(undefined, store)).toBeNull();
    expect(findShortenedUrl("bb", store)).toBeNull();
  });
});
