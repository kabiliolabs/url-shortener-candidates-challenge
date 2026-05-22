import { beforeEach, describe, expect, it } from "vitest";

import { CodeNotFoundError } from "../domain/errors";
import { LongUrl } from "../domain/long-url";
import { ShortCode } from "../domain/short-code";
import { InMemoryCache } from "../test-support/in-memory-cache";
import { InMemoryShortenedUrlRepository } from "../test-support/in-memory-repository";
import { makeResolveShortCodeUseCase } from "./resolve-short-code.use-case";

const TTL = 3600;
const CODE = "aBcDeF1";
const LONG_URL = "https://example.com/destination";

async function flushMicrotasks(): Promise<void> {
  await new Promise<void>((resolve) => setImmediate(resolve));
}

describe("resolveShortCode", () => {
  let repository: InMemoryShortenedUrlRepository;
  let cache: InMemoryCache;

  beforeEach(() => {
    repository = new InMemoryShortenedUrlRepository();
    cache = new InMemoryCache();
    repository.seed({
      code: ShortCode.fromTrusted(CODE),
      longUrl: LongUrl.fromTrusted(LONG_URL),
      createdAt: new Date(),
      clickCount: 0,
      lastClickedAt: null,
    });
  });

  it("returns the cached value on a cache hit and skips the repo lookup", async () => {
    cache.entries.set(`shortcode:${CODE}`, LONG_URL);
    const resolve = makeResolveShortCodeUseCase({
      repository,
      cache,
      cacheTtlSeconds: TTL,
    });

    const result = await resolve(CODE);
    await flushMicrotasks();

    expect(result).toBe(LONG_URL);
    expect(cache.setCalls).toHaveLength(0);
    expect(repository.incrementCalls).toEqual([CODE]);
  });

  it("populates the cache on a cache miss and increments clicks", async () => {
    const resolve = makeResolveShortCodeUseCase({
      repository,
      cache,
      cacheTtlSeconds: TTL,
    });

    const result = await resolve(CODE);
    await flushMicrotasks();

    expect(result).toBe(LONG_URL);
    expect(cache.setCalls).toEqual([
      { key: `shortcode:${CODE}`, value: LONG_URL, ttlSeconds: TTL },
    ]);
    expect(repository.incrementCalls).toEqual([CODE]);
  });

  it("throws CodeNotFoundError when the code is unknown", async () => {
    const resolve = makeResolveShortCodeUseCase({
      repository,
      cache,
      cacheTtlSeconds: TTL,
    });

    await expect(resolve("zzzzzzz")).rejects.toBeInstanceOf(CodeNotFoundError);
    expect(cache.setCalls).toHaveLength(0);
    expect(repository.incrementCalls).toEqual([]);
  });

  it("treats malformed short codes as CodeNotFoundError (not InvalidShortCodeError)", async () => {
    const resolve = makeResolveShortCodeUseCase({
      repository,
      cache,
      cacheTtlSeconds: TTL,
    });

    await expect(resolve("bad!")).rejects.toBeInstanceOf(CodeNotFoundError);
  });
});
