import { describe, expect, it } from "vitest";
import { ShortUrl } from "./short-url";
import { InvalidUrlError } from "./errors";

describe("ShortUrl", () => {
  it("constructs with the given code and URL, defaulting clickCount to 0", () => {
    const shortUrl = new ShortUrl({ code: "ab", originalUrl: "https://example.com" });

    expect(shortUrl.code).toBe("ab");
    expect(shortUrl.originalUrl).toBe("https://example.com");
    expect(shortUrl.clickCount).toBe(0);
    expect(shortUrl.createdAt).toBeInstanceOf(Date);
  });

  it("throws InvalidUrlError when originalUrl is missing", () => {
    expect(() => new ShortUrl({ code: "ab", originalUrl: "" })).toThrow(
      InvalidUrlError,
    );
  });

  it("increments clickCount on recordClick", () => {
    const shortUrl = new ShortUrl({ code: "ab", originalUrl: "https://example.com" });

    shortUrl.recordClick();

    expect(shortUrl.clickCount).toBe(1);
  });
});
