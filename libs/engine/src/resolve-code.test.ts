import { describe, expect, it } from "vitest";
import { resolveCode } from "./resolve-code";
import { shortenUrl } from "./shorten-url";
import { InMemoryShortLinkRepository } from "./testing/in-memory-short-link-repository";

describe("resolveCode", () => {
  it("returns the URL and increments clicks for an existing code", async () => {
    const repository = new InMemoryShortLinkRepository();
    const created = await shortenUrl(repository, "https://example.com");
    if (!created.ok) {
      throw new Error(created.message);
    }

    const url = await resolveCode(repository, created.code);
    const stored = await repository.findByUrl("https://example.com/");

    expect(url).toBe("https://example.com/");
    expect(stored?.clicks).toBe(1);
  });

  it("accumulates clicks across multiple resolutions", async () => {
    const repository = new InMemoryShortLinkRepository();
    const created = await shortenUrl(repository, "https://example.com");
    if (!created.ok) {
      throw new Error(created.message);
    }

    await resolveCode(repository, created.code);
    await resolveCode(repository, created.code);
    await resolveCode(repository, created.code);

    const stored = await repository.findByUrl("https://example.com/");

    expect(stored?.clicks).toBe(3);
  });

  it("returns null for an unknown code", async () => {
    const repository = new InMemoryShortLinkRepository();

    expect(await resolveCode(repository, "missing")).toBeNull();
  });
});
