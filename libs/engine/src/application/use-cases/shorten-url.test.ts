import { describe, it, expect, vi } from "vitest";
import { ShortenUrlUseCase } from "./shorten-url";
import { InMemoryUrlRepository } from "../../infrastructure/repositories/in-memory-url-repository";
import { RandomShortCodeGenerator } from "../../infrastructure/services/random-short-code-generator";
import { ShortCode } from "../../domain/value-objects/short-code";
import { ShortenedUrl } from "../../domain/entities/shortened-url";
import { LongUrl } from "../../domain/value-objects/long-url";

describe("ShortenUrlUseCase", () => {
  it("shortens a valid URL, saves it, and returns the entry", async () => {
    const repo = new InMemoryUrlRepository();
    const useCase = new ShortenUrlUseCase(repo, new RandomShortCodeGenerator());

    const result = await useCase.execute("https://example.com");

    expect(result).toBeInstanceOf(ShortenedUrl);
    expect(result.longUrl.value).toBe("https://example.com/");
    expect(await repo.existsByCode(result.shortCode)).toBe(true);
  });

  it("throws for an invalid URL", async () => {
    const useCase = new ShortenUrlUseCase(
      new InMemoryUrlRepository(),
      new RandomShortCodeGenerator(),
    );
    await expect(useCase.execute("not-a-url")).rejects.toThrow();
  });

  it("retries when the generated code is already taken", async () => {
    const repo = new InMemoryUrlRepository();
    const takenCode = new ShortCode("aaaaaaa");
    await repo.save(new ShortenedUrl(takenCode, new LongUrl("https://taken.com")));

    const generator = {
      generate: vi
        .fn()
        .mockReturnValueOnce(new ShortCode("aaaaaaa"))
        .mockReturnValueOnce(new ShortCode("bbbbbbb")),
    };

    const result = await new ShortenUrlUseCase(repo, generator).execute("https://new.com");

    expect(result.shortCode.value).toBe("bbbbbbb");
    expect(generator.generate).toHaveBeenCalledTimes(2);
  });

  it("throws after exhausting MAX_ATTEMPTS with all collisions", async () => {
    const repo = new InMemoryUrlRepository();
    const generator = { generate: vi.fn().mockReturnValue(new ShortCode("aaaaaaa")) };

    // pre-fill so "aaaaaaa" is always taken
    await repo.save(new ShortenedUrl(new ShortCode("aaaaaaa"), new LongUrl("https://taken.com")));

    await expect(
      new ShortenUrlUseCase(repo, generator).execute("https://example.com"),
    ).rejects.toThrow("Failed to generate a unique short code after maximum attempts");

    expect(generator.generate).toHaveBeenCalledTimes(10);
  });
});
