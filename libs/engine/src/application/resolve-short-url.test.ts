import { describe, expect, it, vi } from "vitest";
import { resolveShortUrlUseCase } from "./resolve-short-url";
import { InMemoryShortUrlRepository } from "../testing/in-memory-short-url-repository";

describe("resolveShortUrlUseCase", () => {
  it("returns the original URL and increments clicks exactly once", async () => {
    const repository = new InMemoryShortUrlRepository();
    await repository.save({ code: "known01", originalUrl: "https://example.com/" });
    const resolveShortUrl = resolveShortUrlUseCase({ repository });

    const result = await resolveShortUrl("known01");

    expect(result?.originalUrl).toBe("https://example.com/");
    expect((await repository.findByCode("known01"))?.clicks).toBe(1);
  });

  it("returns null for an unknown code and does not increment", async () => {
    const repository = new InMemoryShortUrlRepository();
    const incrementClicks = vi.spyOn(repository, "incrementClicks");
    const resolveShortUrl = resolveShortUrlUseCase({ repository });

    const result = await resolveShortUrl("missing");

    expect(result).toBeNull();
    expect(incrementClicks).not.toHaveBeenCalled();
  });
});
