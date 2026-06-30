import { describe, expect, it, vi } from "vitest";
import { createShortUrlUseCase } from "./create-short-url";
import { InMemoryShortUrlRepository } from "../testing/in-memory-short-url-repository";
import { DuplicateCodeError } from "../domain/errors";
import type { CodeGenerator } from "../domain/ports/code-generator";

function queuedGenerator(...codes: string[]): CodeGenerator {
  const queue = [...codes];
  return {
    generate: () => {
      const next = queue.shift();
      if (next === undefined) {
        throw new Error("queuedGenerator ran out of codes");
      }
      return next;
    },
  };
}

describe("createShortUrlUseCase", () => {
  it("saves once on the happy path and returns the stored record", async () => {
    const repository = new InMemoryShortUrlRepository();
    const save = vi.spyOn(repository, "save");
    const createShortUrl = createShortUrlUseCase({
      repository,
      codeGenerator: queuedGenerator("abc1234"),
    });

    const result = await createShortUrl({ url: "https://example.com" });

    expect(save).toHaveBeenCalledTimes(1);
    expect(result.code).toBe("abc1234");
    expect(result.originalUrl).toBe("https://example.com/");
  });

  it("regenerates and retries when the first code collides", async () => {
    const repository = new InMemoryShortUrlRepository();
    await repository.save({ code: "taken01", originalUrl: "https://seed.com/" });
    const save = vi.spyOn(repository, "save");

    const createShortUrl = createShortUrlUseCase({
      repository,
      codeGenerator: queuedGenerator("taken01", "fresh02"),
    });

    const result = await createShortUrl({ url: "https://example.com" });

    expect(save).toHaveBeenCalledTimes(2);
    expect(result.code).toBe("fresh02");
  });

  it("gives up with DuplicateCodeError after max attempts", async () => {
    const repository = new InMemoryShortUrlRepository();
    await repository.save({ code: "dupe000", originalUrl: "https://seed.com/" });
    const save = vi.spyOn(repository, "save");

    const createShortUrl = createShortUrlUseCase({
      repository,
      codeGenerator: queuedGenerator("dupe000", "dupe000", "dupe000"),
      maxAttempts: 3,
    });

    await expect(createShortUrl({ url: "https://example.com" })).rejects.toThrow(
      DuplicateCodeError,
    );
    expect(save).toHaveBeenCalledTimes(3);
  });
});
