import { describe, it, expect } from "vitest";
import { ShortenedUrl } from "./shortened-url";
import { ShortCode } from "../value-objects/short-code";
import { LongUrl } from "../value-objects/long-url";

describe("ShortenedUrl", () => {
  const code = new ShortCode("abc1234");
  const url = new LongUrl("https://example.com");

  it("stores shortCode and longUrl", () => {
    const entity = new ShortenedUrl(code, url);
    expect(entity.shortCode).toBe(code);
    expect(entity.longUrl).toBe(url);
  });

  it("equals returns true for same short code", () => {
    const a = new ShortenedUrl(new ShortCode("abc1234"), new LongUrl("https://a.com"));
    const b = new ShortenedUrl(new ShortCode("abc1234"), new LongUrl("https://b.com"));
    expect(a.equals(b)).toBe(true);
  });

  it("equals returns false for different short code", () => {
    const a = new ShortenedUrl(new ShortCode("abc1234"), new LongUrl("https://a.com"));
    const b = new ShortenedUrl(new ShortCode("xyz9876"), new LongUrl("https://a.com"));
    expect(a.equals(b)).toBe(false);
  });
});
