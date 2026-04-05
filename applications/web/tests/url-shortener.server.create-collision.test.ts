import { describe, expect, it, vi } from "vitest";

import {
  MAX_CODE_GENERATION_ATTEMPTS,
  createShortenedUrl,
} from "../app/domain/url-shortener.server";
import { createInMemoryRepository } from "./helpers/in-memory-repository";

describe("collision handling in createShortenedUrl", () => {
  it("retries with a new code when the first code collides", async () => {
    const repository = createInMemoryRepository();
    await repository.create({ code: "taken", originalUrl: "https://existing.com" });

    const codes = ["taken", "fresh"];
    const createCode = vi.fn(() => codes.shift()!);

    const result = await createShortenedUrl("https://example.com/new", {
      currentBaseUrl: "http://test.example",
      createCode,
      repository,
    });

    expect(result).toEqual({ shortenedUrl: "http://test.example/s/fresh" });
    expect(createCode).toHaveBeenCalledTimes(2);

    const stored = await repository.findByCode("fresh");
    expect(stored?.originalUrl).toBe("https://example.com/new");
  });

  it("retries multiple times before succeeding", async () => {
    const repository = createInMemoryRepository();
    await repository.create({ code: "c1", originalUrl: "https://a.com" });
    await repository.create({ code: "c2", originalUrl: "https://b.com" });
    await repository.create({ code: "c3", originalUrl: "https://c.com" });

    const codes = ["c1", "c2", "c3", "c4"];
    const createCode = vi.fn(() => codes.shift()!);

    const result = await createShortenedUrl("https://example.com/new", {
      currentBaseUrl: "http://test.example",
      createCode,
      repository,
    });

    expect(result).toEqual({ shortenedUrl: "http://test.example/s/c4" });
    expect(createCode).toHaveBeenCalledTimes(4);
  });

  it("does not overwrite an existing URL when a code collides", async () => {
    const repository = createInMemoryRepository();
    await repository.create({ code: "taken", originalUrl: "https://original.com" });

    const codes = ["taken", "new-code"];
    const createCode = vi.fn(() => codes.shift()!);

    await createShortenedUrl("https://different.com", {
      currentBaseUrl: "http://test.example",
      createCode,
      repository,
    });

    const original = await repository.findByCode("taken");
    expect(original?.originalUrl).toBe("https://original.com");
  });

  it("throws after exhausting all retry attempts", async () => {
    const repository = createInMemoryRepository();
    await repository.create({ code: "only", originalUrl: "https://a.com" });

    const createCode = vi.fn(() => "only");

    await expect(
      createShortenedUrl("https://example.com/new", {
        currentBaseUrl: "http://test.example",
        createCode,
        repository,
      }),
    ).rejects.toThrow(/Failed to generate a unique code/);

    expect(createCode).toHaveBeenCalledTimes(MAX_CODE_GENERATION_ATTEMPTS);
  });

  it("rethrows non-collision errors immediately", async () => {
    const repository = createInMemoryRepository();
    const dbError = new Error("connection lost");
    repository.create = vi.fn().mockRejectedValue(dbError);

    const createCode = vi.fn(() => "any-code");

    await expect(
      createShortenedUrl("https://example.com", {
        currentBaseUrl: "http://test.example",
        createCode,
        repository,
      }),
    ).rejects.toThrow("connection lost");

    expect(createCode).toHaveBeenCalledTimes(1);
  });
});
