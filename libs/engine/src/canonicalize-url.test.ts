import { describe, expect, it } from "vitest";
import { canonicalizeUrl } from "./canonicalize-url";

describe("canonicalizeUrl", () => {
  it("trims the input and normalizes it with URL.href", () => {
    const result = canonicalizeUrl("  HTTPS://Example.COM  ");

    expect(result).toEqual({ ok: true, url: "https://example.com/" });
  });

  it("rejects an unparseable URL", () => {
    expect(canonicalizeUrl("not a url").ok).toBe(false);
  });

  it("rejects a scheme-less URL", () => {
    expect(canonicalizeUrl("example.com").ok).toBe(false);
  });

  it.each([
    "javascript:alert(1)",
    "ftp://example.com",
    "mailto:a@example.com",
    "file:///etc/passwd",
  ])("rejects the non-http(s) URL %s", (input) => {
    expect(canonicalizeUrl(input).ok).toBe(false);
  });

  it("keeps http as is, without upgrading to https", () => {
    expect(canonicalizeUrl("http://example.com")).toEqual({
      ok: true,
      url: "http://example.com/",
    });
  });

  it("preserves path, query and hash", () => {
    expect(canonicalizeUrl("https://example.com/a?ref=ig#top")).toEqual({
      ok: true,
      url: "https://example.com/a?ref=ig#top",
    });
  });
});
