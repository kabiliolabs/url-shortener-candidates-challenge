import { describe, expect, it, vi } from "vitest";

import {
  buildShortenedUrlPrefix,
  createShortenedUrl,
  findShortenedUrl,
  getSubmittedUrl,
  handleShortenUrlAction,
} from "../app/domain/url-shortener.server";
import { createInMemoryRepository } from "./helpers/in-memory-repository";

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

  it("stores the URL and builds a shortened URL", async () => {
    const repository = createInMemoryRepository();

    const result = await createShortenedUrl("https://example.com/page", {
      currentBaseUrl: "http://test.example",
      createCode: () => "aa",
      repository,
    });

    expect(result).toEqual({
      shortenedUrl: "http://test.example/s/aa",
    });

    const stored = await repository.findByCode("aa");
    expect(stored?.originalUrl).toBe("https://example.com/page");
  });

  it("returns a validation error before generating a code", async () => {
    const createCode = vi.fn(() => "aa");
    const repository = createInMemoryRepository();
    const request = new Request("http://test.example/", {
      method: "POST",
      body: new FormData(),
    });

    const result = await handleShortenUrlAction(request, {
      currentBaseUrl: "http://test.example",
      createCode,
      repository,
    });

    expect(result).toEqual({ error: "URL is required" });
    expect(createCode).not.toHaveBeenCalled();
  });

  it("finds a stored shortened URL by code", async () => {
    const repository = createInMemoryRepository();
    await repository.create({
      code: "aa",
      originalUrl: "https://example.com/page",
    });

    expect(await findShortenedUrl("aa", repository)).toBe(
      "https://example.com/page",
    );
  });

  it("returns null when a code is missing or unknown", async () => {
    const repository = createInMemoryRepository();
    await repository.create({
      code: "aa",
      originalUrl: "https://example.com/page",
    });

    expect(await findShortenedUrl(undefined, repository)).toBeNull();
    expect(await findShortenedUrl("bb", repository)).toBeNull();
  });
});
