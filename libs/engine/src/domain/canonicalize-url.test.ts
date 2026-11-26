import { describe, expect, it } from "vitest";
import { canonicalizeUrl, MAX_URL_LENGTH } from "./canonicalize-url";

function urlOfLength(length: number): string {
  const prefix = "https://example.com/";
  return prefix + "a".repeat(length - prefix.length);
}

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

  it.each(["https://user:pass@example.com", "https://user@example.com"])(
    "rejects a URL with credentials %s",
    (input) => {
      const result = canonicalizeUrl(input);

      expect(result).toEqual({
        ok: false,
        message: "URLs with a username or password can't be shortened.",
      });
    },
  );

  it("accepts a URL of MAX_URL_LENGTH and rejects one character more", () => {
    expect(canonicalizeUrl(urlOfLength(MAX_URL_LENGTH))).toEqual({
      ok: true,
      url: urlOfLength(MAX_URL_LENGTH),
    });
    expect(canonicalizeUrl(urlOfLength(MAX_URL_LENGTH + 1)).ok).toBe(false);
  });

  it("preserves path, query and hash", () => {
    expect(canonicalizeUrl("https://example.com/a?ref=ig#top")).toEqual({
      ok: true,
      url: "https://example.com/a?ref=ig#top",
    });
  });
});
