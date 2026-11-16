import { describe, expect, it } from "vitest";
import { InMemoryUrlRepository } from "./in-memory-url-repository";
import { ShortUrl } from "../domain/short-url";

describe("InMemoryUrlRepository", () => {
  it("saves and finds a ShortUrl by code", async () => {
    const repository = new InMemoryUrlRepository();
    const shortUrl = new ShortUrl({ code: "ab", originalUrl: "https://example.com" });

    await repository.save(shortUrl);

    expect(await repository.findByCode("ab")).toBe(shortUrl);
  });

  it("returns null when the code is not found", async () => {
    const repository = new InMemoryUrlRepository();

    expect(await repository.findByCode("zz")).toBeNull();
  });

  it("reports whether a code exists", async () => {
    const repository = new InMemoryUrlRepository();
    const shortUrl = new ShortUrl({ code: "ab", originalUrl: "https://example.com" });

    await repository.save(shortUrl);

    expect(await repository.exists("ab")).toBe(true);
    expect(await repository.exists("zz")).toBe(false);
  });

  it("lists saved ShortUrls newest first, paginated", async () => {
    const repository = new InMemoryUrlRepository();
    const first = new ShortUrl({ code: "ab", originalUrl: "https://example.com" });
    const second = new ShortUrl({ code: "cd", originalUrl: "https://example.org" });

    await repository.save(first);
    await repository.save(second);

    expect(await repository.list({ limit: 10, offset: 0 })).toEqual([second, first]);
    expect(await repository.list({ limit: 1, offset: 1 })).toEqual([first]);
  });
});
