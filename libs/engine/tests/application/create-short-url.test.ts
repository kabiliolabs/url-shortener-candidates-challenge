import { describe, expect, it } from "vitest";
import { CreateShortUrl } from "../../src/application/use-cases/create-short-url";
import {
  InvalidDestinationUrlError,
  ShortCodeGenerationExhaustedError,
} from "../../src/domain/errors";
import type { Clock } from "../../src/application/ports/clock";
import type { ShortCodeGenerator } from "../../src/application/ports/short-code-generator";
import { InMemoryUrlRepository } from "../helpers/in-memory-url-repository";

const now = new Date("2026-10-13T10:00:00.000Z");
const fixedClock: Clock = { now: () => now };

class SequenceCodeGenerator implements ShortCodeGenerator {
  constructor(private readonly codes: string[]) {}

  generate(): string {
    const code = this.codes.shift();
    if (!code) throw new Error("No code configured for this test.");
    return code;
  }
}

describe("CreateShortUrl", () => {
  it("validates and persists a new short URL", async () => {
    const repository = new InMemoryUrlRepository();
    const useCase = new CreateShortUrl(
      repository,
      new SequenceCodeGenerator(["aB3_-xY9"]),
      fixedClock,
    );

    const result = await useCase.execute({
      originalUrl: "  https://example.com/articles/clean-architecture  ",
    });

    expect(result).toEqual({
      code: "aB3_-xY9",
      originalUrl: "https://example.com/articles/clean-architecture",
      createdAt: now,
      clicks: 0,
    });
    expect(repository.find("aB3_-xY9")).toEqual(result);
  });

  it("rejects an invalid destination before persisting", async () => {
    const repository = new InMemoryUrlRepository();
    const useCase = new CreateShortUrl(
      repository,
      new SequenceCodeGenerator(["aB3_-xY9"]),
      fixedClock,
    );

    await expect(useCase.execute({ originalUrl: "javascript:alert(1)" })).rejects.toBeInstanceOf(
      InvalidDestinationUrlError,
    );
    expect(await repository.list()).toHaveLength(0);
  });

  it("retries with a new code after a collision", async () => {
    const repository = new InMemoryUrlRepository();
    repository.seed({
      code: "dup_code",
      originalUrl: "https://existing.example.com",
      createdAt: now,
      clicks: 0,
    });
    const useCase = new CreateShortUrl(
      repository,
      new SequenceCodeGenerator(["dup_code", "unique_1"]),
      fixedClock,
    );

    const result = await useCase.execute({ originalUrl: "https://example.com" });

    expect(result.code).toBe("unique_1");
  });

  it("fails after the configured number of collisions", async () => {
    const repository = new InMemoryUrlRepository();
    repository.seed({
      code: "dup_code",
      originalUrl: "https://existing.example.com",
      createdAt: now,
      clicks: 0,
    });
    const useCase = new CreateShortUrl(
      repository,
      new SequenceCodeGenerator(["dup_code", "dup_code"]),
      fixedClock,
      { maxAttempts: 2 },
    );

    await expect(useCase.execute({ originalUrl: "https://example.com" })).rejects.toBeInstanceOf(
      ShortCodeGenerationExhaustedError,
    );
  });
});
