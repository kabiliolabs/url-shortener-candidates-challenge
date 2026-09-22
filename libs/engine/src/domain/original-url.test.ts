import { describe, expect, it } from "vitest";
import {
  MAX_URL_LENGTH,
  normalizeOriginalUrl,
  UrlValidationError,
  type UrlValidationReason,
} from "./original-url";

const PUBLIC_URL = "http://localhost:3000";

function reasonFor(input: string, publicUrl = PUBLIC_URL) {
  try {
    normalizeOriginalUrl(input, publicUrl);
  } catch (error) {
    if (error instanceof UrlValidationError) return error.reason;
    throw error;
  }
  return "accepted";
}

describe("normalizeOriginalUrl", () => {
  it.each([
    ["  https://example.com/page  ", "https://example.com/page"],
    ["HTTPS://Example.COM:443", "https://example.com/"],
    ["https:\\\\evil.com\\path", "https://evil.com/path"],
    ["https://exa\tmple.com/a", "https://example.com/a"],
    [
      "https://www.example.com/a?utm_source=x&b=2#section",
      "https://www.example.com/a?utm_source=x&b=2#section",
    ],
  ])("normalizes %j to %j", (input, expected) => {
    expect(normalizeOriginalUrl(input, PUBLIC_URL)).toBe(expected);
  });

  it.each<[string, UrlValidationReason]>([
    ["", "required"],
    ["   ", "required"],
    ["example.com", "missingScheme"],
    ["example.com/path?q=1", "missingScheme"],
    ["not a url", "invalid"],
    ["//evil.com", "invalid"],
    ["ftp://x.com", "scheme"],
    ["data:text/html,<script>alert(1)</script>", "scheme"],
    ["javascript:alert(1)", "scheme"],
    ["java\nscript:alert(1)", "scheme"],
    ["https://user:pass@example.com", "credentials"],
    ["https://user@example.com", "credentials"],
    ["http://localhost:3000/s/abc1234", "selfLink"],
    ["https://LOCALHOST:3000/urls", "selfLink"],
  ])("rejects %j as %s", (input, reason) => {
    expect(reasonFor(input)).toBe(reason);
  });

  it("only treats the exact PUBLIC_URL host as a self-link", () => {
    expect(reasonFor("https://www.sho.rt/x", "https://sho.rt")).toBe("accepted");
    expect(reasonFor("http://localhost:3001/x")).toBe("accepted");
  });

  it("ignores a trailing slash in PUBLIC_URL when detecting self-links", () => {
    expect(reasonFor("http://localhost:3000/x", "http://localhost:3000/")).toBe(
      "selfLink",
    );
  });

  it("measures length on the normalized URL", () => {
    const prefix = "https://example.com/";
    const atLimit = prefix + "a".repeat(MAX_URL_LENGTH - prefix.length);
    expect(normalizeOriginalUrl(atLimit, PUBLIC_URL)).toHaveLength(MAX_URL_LENGTH);
    expect(reasonFor(atLimit + "a")).toBe("tooLong");

    // Each space becomes %20, so this fits as typed but not once normalized.
    const growsWhenEncoded = prefix + " ".repeat(700) + "x";
    expect(growsWhenEncoded.length).toBeLessThan(MAX_URL_LENGTH);
    expect(reasonFor(growsWhenEncoded)).toBe("tooLong");
  });

  it("exposes a user-facing message", () => {
    expect(() => normalizeOriginalUrl("example.com", PUBLIC_URL)).toThrow(
      "Your URL should start with http:// or https://",
    );
  });
});
