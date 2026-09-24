import { describe, expect, it } from "vitest";
import { UrlShortenerService } from "./application/url-shortener-service";
import { CodeGenerationError, InvalidUrlError, UrlNotFoundError } from "./domain/errors";
import type { ShortCodeGenerator } from "./domain/short-code-generator";
import { InMemoryUrlRepository } from "./infrastructure/in-memory-url-repository";

class SequenceGenerator implements ShortCodeGenerator {
  private index = 0;
  private readonly codes: string[];
  constructor(codes: string[]) {
    this.codes = codes;
  }
  generate(): string {
    return this.codes[Math.min(this.index++, this.codes.length - 1)];
  }
}

const setup = (codes: string[] = ["aaa", "bbb", "ccc"]) => {
  const repository = new InMemoryUrlRepository();
  return { repository, service: new UrlShortenerService(repository, new SequenceGenerator(codes)) };
};

describe("UrlShortenerService", () => {
  it("shortens a valid URL", async () => {
    const { service } = setup();
    const result = await service.shorten("https://example.com/page");
    expect(result.code).toBe("aaa");
    expect(result.clicks).toBe(0);
  });

  it("rejects non-http(s) and malformed URLs", async () => {
    const { service } = setup();
    await expect(service.shorten("javascript:alert(1)")).rejects.toThrow(InvalidUrlError);
    await expect(service.shorten("not a url")).rejects.toThrow(InvalidUrlError);
    await expect(service.shorten("")).rejects.toThrow(InvalidUrlError);
    await expect(service.shorten("https://a.com/" + "x".repeat(3000))).rejects.toThrow(InvalidUrlError);
  });

  it("retries with a new code on collision", async () => {
    const { service } = setup(["aaa", "aaa", "bbb"]);
    await service.shorten("https://one.com");
    const second = await service.shorten("https://two.com");
    expect(second.code).toBe("bbb");
  });

  it("gives up after too many collisions", async () => {
    const { service } = setup(["aaa"]);
    await service.shorten("https://one.com");
    await expect(service.shorten("https://two.com")).rejects.toThrow(CodeGenerationError);
  });

  it("counts a click each time a code is resolved", async () => {
    const { service } = setup();
    await service.shorten("https://example.com");
    await service.resolve("aaa");
    const resolved = await service.resolve("aaa");
    expect(resolved.clicks).toBe(2);
  });

  it("throws when resolving an unknown code", async () => {
    const { service } = setup();
    await expect(service.resolve("nope")).rejects.toThrow(UrlNotFoundError);
  });

  it("lists URLs newest first", async () => {
    const { service } = setup();
    await service.shorten("https://one.com");
    await service.shorten("https://two.com");
    const list = await service.list();
    expect(list.map((u) => u.code)).toEqual(["bbb", "aaa"]);
  });
});