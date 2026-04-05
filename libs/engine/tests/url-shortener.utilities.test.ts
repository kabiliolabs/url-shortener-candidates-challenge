import { describe, expect, it } from "vitest";

import {
  buildShortenedUrlPrefix,
  createShortenedUrl,
  findShortenedUrl,
} from "../src";
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
