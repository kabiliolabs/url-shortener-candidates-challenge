import { beforeEach, describe, expect, it } from "vitest";

import {
  CodeCollisionError,
  InvalidUrlError,
  RateLimitExceededError,
} from "../domain/errors";
import { InMemoryShortenedUrlRepository } from "../test-support/in-memory-repository";
import { QueueCodeGenerator } from "../test-support/queue-code-generator";
import { TestRateLimiter } from "../test-support/test-rate-limiter";
import { makeShortenUrlUseCase } from "./shorten-url.use-case";

const BASE_URL = "http://localhost:3000";
const FORBIDDEN_HOST = "localhost:3000";

describe("shortenUrl", () => {
  let repository: InMemoryShortenedUrlRepository;
  let rateLimiter: TestRateLimiter;

  beforeEach(() => {
    repository = new InMemoryShortenedUrlRepository();
    rateLimiter = new TestRateLimiter();
  });

  it("shortens a valid URL on the happy path", async () => {
    const codeGenerator = new QueueCodeGenerator(["aBcDeF1"]);
    const shortenUrl = makeShortenUrlUseCase({
      repository,
      codeGenerator,
      rateLimiter,
      baseUrl: BASE_URL,
      forbiddenHost: FORBIDDEN_HOST,
    });

    const result = await shortenUrl({
      url: "https://example.com/long",
      clientIp: "1.2.3.4",
    });

    expect(result.code.value).toBe("aBcDeF1");
    expect(result.shortUrl).toBe("http://localhost:3000/s/aBcDeF1");
    expect(repository.store.size).toBe(1);
    expect(rateLimiter.calls).toEqual(["1.2.3.4"]);
  });

  it("throws RateLimitExceededError when limiter denies", async () => {
    rateLimiter.setDecision({ allowed: false, retryAfterSeconds: 42 });
    const codeGenerator = new QueueCodeGenerator(["aBcDeF1"]);
    const shortenUrl = makeShortenUrlUseCase({
      repository,
      codeGenerator,
      rateLimiter,
      baseUrl: BASE_URL,
      forbiddenHost: FORBIDDEN_HOST,
    });

    const rejection = shortenUrl({
      url: "https://example.com",
      clientIp: "1.2.3.4",
    });
    await expect(rejection).rejects.toBeInstanceOf(RateLimitExceededError);
    await expect(rejection).rejects.toMatchObject({ retryAfterSeconds: 42 });
    expect(repository.store.size).toBe(0);
  });

  it("throws InvalidUrlError on bad input", async () => {
    const codeGenerator = new QueueCodeGenerator(["aBcDeF1"]);
    const shortenUrl = makeShortenUrlUseCase({
      repository,
      codeGenerator,
      rateLimiter,
      baseUrl: BASE_URL,
      forbiddenHost: FORBIDDEN_HOST,
    });

    await expect(
      shortenUrl({ url: "javascript:alert(1)", clientIp: "1.2.3.4" }),
    ).rejects.toBeInstanceOf(InvalidUrlError);
  });

  it("retries on code collision and succeeds on the next attempt", async () => {
    const existing = "aaaaaaa";
    repository.seed({
      code: { value: existing, toString: () => existing } as never,
      longUrl: { value: "https://prior.test", toString: () => "" } as never,
      createdAt: new Date(),
      clickCount: 0,
      lastClickedAt: null,
    });
    const codeGenerator = new QueueCodeGenerator([existing, "bbbbbbb"]);
    const shortenUrl = makeShortenUrlUseCase({
      repository,
      codeGenerator,
      rateLimiter,
      baseUrl: BASE_URL,
      forbiddenHost: FORBIDDEN_HOST,
    });

    const result = await shortenUrl({
      url: "https://example.com",
      clientIp: "1.2.3.4",
    });

    expect(result.code.value).toBe("bbbbbbb");
  });

  it("throws CodeCollisionError after exhausting retries", async () => {
    const code = "aaaaaaa";
    repository.seed({
      code: { value: code, toString: () => code } as never,
      longUrl: { value: "https://prior.test", toString: () => "" } as never,
      createdAt: new Date(),
      clickCount: 0,
      lastClickedAt: null,
    });
    const codeGenerator = new QueueCodeGenerator([code, code, code]);
    const shortenUrl = makeShortenUrlUseCase({
      repository,
      codeGenerator,
      rateLimiter,
      baseUrl: BASE_URL,
      forbiddenHost: FORBIDDEN_HOST,
      maxCollisionRetries: 3,
    });

    await expect(
      shortenUrl({ url: "https://example.com", clientIp: "1.2.3.4" }),
    ).rejects.toBeInstanceOf(CodeCollisionError);
  });
});
