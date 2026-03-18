import { describe, it, expect } from "vitest";
import { LongUrl } from "./long-url";

describe("LongUrl", () => {
  it("accepts a valid https URL", () => {
    const url = new LongUrl("https://example.com");
    expect(url.value).toBe("https://example.com/");
  });

  it("accepts a valid http URL", () => {
    expect(() => new LongUrl("http://example.com")).not.toThrow();
  });

  it("accepts URLs with paths and query strings", () => {
    expect(() => new LongUrl("https://example.com/path?q=1")).not.toThrow();
  });

  it("throws for a plain string", () => {
    expect(() => new LongUrl("not-a-url")).toThrow('Invalid URL: "not-a-url"');
  });

  it("throws for an empty string", () => {
    expect(() => new LongUrl("")).toThrow();
  });

  it("throws for ftp:// scheme", () => {
    expect(() => new LongUrl("ftp://example.com")).toThrow();
  });

  it("normalizes the URL (adds trailing slash to bare origin)", () => {
    const url = new LongUrl("https://example.com");
    expect(url.value).toBe("https://example.com/");
  });

  it("equals returns true for the same normalized URL", () => {
    const a = new LongUrl("https://example.com");
    const b = new LongUrl("https://example.com");
    expect(a.equals(b)).toBe(true);
  });

  it("equals returns false for different URLs", () => {
    expect(new LongUrl("https://a.com").equals(new LongUrl("https://b.com"))).toBe(false);
  });

  it("toString returns the normalized value", () => {
    expect(new LongUrl("https://example.com").toString()).toBe("https://example.com/");
  });
});
