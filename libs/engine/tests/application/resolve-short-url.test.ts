import { describe, expect, it } from "vitest";
import { ResolveShortUrl } from "../../src/application/use-cases/resolve-short-url";
import { InvalidShortCodeError, ShortUrlNotFoundError } from "../../src/domain/errors";
import { InMemoryUrlRepository } from "../helpers/in-memory-url-repository";

describe("ResolveShortUrl", () => {
  it("resolves a known code and records one click", async () => {
    const repository = new InMemoryUrlRepository();
    repository.seed({
      code: "aB3_-xY9",
      originalUrl: "https://example.com",
      createdAt: new Date("2026-10-13T10:00:00.000Z"),
      clicks: 2,
    });
    const useCase = new ResolveShortUrl(repository);

    const result = await useCase.execute({ code: "aB3_-xY9" });

    expect(result.originalUrl).toBe("https://example.com");
    expect(result.clicks).toBe(3);
    expect(repository.find("aB3_-xY9")?.clicks).toBe(3);
  });

  it("rejects malformed codes before querying the repository", async () => {
    const useCase = new ResolveShortUrl(new InMemoryUrlRepository());

    await expect(useCase.execute({ code: "invalid" })).rejects.toBeInstanceOf(
      InvalidShortCodeError,
    );
  });

  it("reports an unknown code", async () => {
    const useCase = new ResolveShortUrl(new InMemoryUrlRepository());

    await expect(useCase.execute({ code: "missing1" })).rejects.toBeInstanceOf(
      ShortUrlNotFoundError,
    );
  });
});
