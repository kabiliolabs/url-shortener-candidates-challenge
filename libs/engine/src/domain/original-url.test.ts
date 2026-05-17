import { describe, it, expect } from "vitest";
import { OriginalUrl } from "./original-url";

describe("OriginalUrl.create", () => {
  it("accepts a valid http URL", () => {
    const url = OriginalUrl.create("http://example.com");
    expect(url.value).toBe("http://example.com/");
  });

  it("accepts a valid https URL", () => {
    const url = OriginalUrl.create("https://google.com/search?q=hello");
    expect(url.value).toContain("https://google.com");
  });

  it("trims whitespace before validating", () => {
    const url = OriginalUrl.create("  https://example.com  ");
    expect(url.value).toBe("https://example.com/");
  });

  it("throws when URL is empty", () => {
    expect(() => OriginalUrl.create("")).toThrow("URL is required");
  });

  it("throws when URL is only whitespace", () => {
    expect(() => OriginalUrl.create("   ")).toThrow("URL is required");
  });

  it("auto-prefixes https:// when no protocol is given", () => {
    const url = OriginalUrl.create("example.com");
    expect(url.value).toBe("https://example.com/");
  });

  it("throws when URL format is invalid", () => {
    expect(() => OriginalUrl.create("http://")).toThrow("Invalid URL format");
  });

  it("throws when protocol is ftp", () => {
    expect(() => OriginalUrl.create("ftp://example.com")).toThrow(
      "URL must use http or https protocol"
    );
  });

  it("throws when hostname has no dot (e.g. https://ww/)", () => {
    expect(() => OriginalUrl.create("https://ww/")).toThrow(
      "URL must have a valid domain"
    );
  });

  it("accepts localhost as a valid hostname", () => {
    const url = OriginalUrl.create("http://localhost:3000");
    expect(url.value).toContain("localhost");
  });
});

describe("OriginalUrl.fromStorage", () => {
  it("reconstructs without validation", () => {
    const url = OriginalUrl.fromStorage("https://ww/");
    expect(url.value).toBe("https://ww/");
  });
});

describe("OriginalUrl.toString", () => {
  it("returns the URL string", () => {
    const url = OriginalUrl.create("https://example.com");
    expect(url.toString()).toBe("https://example.com/");
  });
});
