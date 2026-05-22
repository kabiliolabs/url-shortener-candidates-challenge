import { describe, expect, it } from "vitest";

import { InvalidUrlError } from "./errors";
import { LongUrl } from "./long-url";

describe("LongUrl.parse", () => {
  it("accepts a valid https URL", () => {
    const url = LongUrl.parse("https://example.com/path?q=1");
    expect(url.value).toBe("https://example.com/path?q=1");
  });

  it("accepts http URLs", () => {
    expect(LongUrl.parse("http://example.com").value).toBe("http://example.com");
  });

  it("trims surrounding whitespace", () => {
    expect(LongUrl.parse("  https://example.com  ").value).toBe("https://example.com");
  });

  it("rejects non-string input", () => {
    expect(() => LongUrl.parse(undefined)).toThrow(InvalidUrlError);
    expect(() => LongUrl.parse(42)).toThrow(InvalidUrlError);
  });

  it("rejects empty strings", () => {
    expect(() => LongUrl.parse("")).toThrow(InvalidUrlError);
    expect(() => LongUrl.parse("   ")).toThrow(InvalidUrlError);
  });

  it("rejects URLs longer than 2048 chars", () => {
    const longTail = "x".repeat(2048);
    expect(() => LongUrl.parse(`https://example.com/${longTail}`)).toThrow(
      InvalidUrlError,
    );
  });

  it("rejects unparseable input", () => {
    expect(() => LongUrl.parse("not-a-url")).toThrow(InvalidUrlError);
  });

  it("rejects javascript: scheme", () => {
    expect(() => LongUrl.parse("javascript:alert(1)")).toThrow(InvalidUrlError);
  });

  it("rejects data: scheme", () => {
    expect(() => LongUrl.parse("data:text/plain;base64,SGk=")).toThrow(InvalidUrlError);
  });

  it("rejects file: scheme", () => {
    expect(() => LongUrl.parse("file:///etc/passwd")).toThrow(InvalidUrlError);
  });

  it("rejects URLs pointing at the configured forbidden host", () => {
    expect(() =>
      LongUrl.parse("https://localhost:3000/s/abc", {
        forbiddenHost: "localhost:3000",
      }),
    ).toThrow(InvalidUrlError);
  });

  it("forbidden-host check is case-insensitive", () => {
    expect(() =>
      LongUrl.parse("https://EXAMPLE.com/x", { forbiddenHost: "example.com" }),
    ).toThrow(InvalidUrlError);
  });
});
