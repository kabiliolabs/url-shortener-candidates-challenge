import { describe, expect, it } from "vitest";
import { ShortenUrl } from "./shorten-url";
import { InMemoryUrlRepository } from "../infrastructure/in-memory-url-repository";
import { ShortUrl } from "../domain/short-url";
import { CodeGenerationError, DuplicateCodeError } from "../domain/errors";
import type { CodeGenerator } from "../domain/code-generator";
import type { UrlRepository } from "../domain/url-repository";

class FixedCodeGenerator implements CodeGenerator {
  constructor(private readonly code: string) {}
  generate(): string {
    return this.code;
  }
}

class SequenceCodeGenerator implements CodeGenerator {
  private index = 0;
  constructor(private readonly codes: string[]) {}
  generate(): string {
    const code = this.codes[this.index];
    this.index += 1;
    return code;
  }
}

describe("ShortenUrl", () => {
  it("saves and returns a new ShortUrl on the success path", async () => {
    const repository = new InMemoryUrlRepository();
    const useCase = new ShortenUrl(repository, new FixedCodeGenerator("ab"));

    const shortUrl = await useCase.execute("https://example.com");

    expect(shortUrl.code).toBe("ab");
    expect(shortUrl.originalUrl).toBe("https://example.com");
    expect(await repository.findByCode("ab")).toBe(shortUrl);
  });

  it("retries on collision and succeeds once a free code is generated", async () => {
    const repository = new InMemoryUrlRepository();
    await repository.save(
      new ShortUrl({ code: "taken-1", originalUrl: "https://existing.com" }),
    );
    const useCase = new ShortenUrl(
      repository,
      new SequenceCodeGenerator(["taken-1", "taken-1", "free-1"]),
    );

    const shortUrl = await useCase.execute("https://example.com");

    expect(shortUrl.code).toBe("free-1");
    expect(await repository.findByCode("free-1")).toBe(shortUrl);
  });

  it("retries when the repository reports a storage-level collision on save, instead of crashing", async () => {
    const repository = new InMemoryUrlRepository();
    let saveAttempts = 0;
    const racyRepository: UrlRepository = {
      findByCode: (code) => repository.findByCode(code),
      list: (page) => repository.list(page),
      exists: () => Promise.resolve(false),
      incrementClicks: (code) => repository.incrementClicks(code),
      save: async (shortUrl) => {
        saveAttempts += 1;
        if (saveAttempts < 2) {
          throw new DuplicateCodeError(shortUrl.code);
        }
        return repository.save(shortUrl);
      },
    };
    const useCase = new ShortenUrl(
      racyRepository,
      new FixedCodeGenerator("raced-1"),
    );

    const shortUrl = await useCase.execute("https://example.com");

    expect(shortUrl.code).toBe("raced-1");
    expect(saveAttempts).toBe(2);
  });

  it("throws CodeGenerationError after exhausting all retries without modifying existing entries", async () => {
    const repository = new InMemoryUrlRepository();
    const existing = new ShortUrl({
      code: "taken-1",
      originalUrl: "https://existing.com",
    });
    await repository.save(existing);
    const useCase = new ShortenUrl(
      repository,
      new FixedCodeGenerator("taken-1"),
    );

    await expect(useCase.execute("https://example.com")).rejects.toThrow(
      CodeGenerationError,
    );
    expect(await repository.findByCode("taken-1")).toBe(existing);
  });
});
