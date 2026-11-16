import { describe, expect, it } from "vitest";
import { assertShortenable, MAX_URL_LENGTH } from "./assert-shortenable";
import { InvalidUrlError } from "./errors";

const OWN_HOSTNAME = "short.example";

function rejectionReason(url: string): string | undefined {
  try {
    assertShortenable(url, OWN_HOSTNAME);
    return undefined;
  } catch (error) {
    expect(error).toBeInstanceOf(InvalidUrlError);
    return (error as Error).message;
  }
}

describe("assertShortenable", () => {
  it("accepts a valid http(s) URL", () => {
    expect(rejectionReason("https://example.com/path?q=1")).toBeUndefined();
    expect(rejectionReason("http://example.com")).toBeUndefined();
  });

  it.each([
    ["empty", "", "URL is required"],
    ["javascript: scheme", "javascript:alert(1)", "Only http and https URLs are allowed"],
    ["ftp: scheme", "ftp://example.com/file", "Only http and https URLs are allowed"],
    ["malformed", "not a url", "URL is not valid"],
    ["self-domain", "https://short.example/s/abc", "URL cannot point to this service"],
    [
      "too long",
      `https://example.com/${"a".repeat(MAX_URL_LENGTH)}`,
      `URL must be at most ${MAX_URL_LENGTH} characters`,
    ],
  ])("rejects %s", (_name, url, reason) => {
    expect(rejectionReason(url)).toBe(reason);
  });

  it("matches the own hostname case-insensitively", () => {
    expect(rejectionReason("https://SHORT.example")).toBe(
      "URL cannot point to this service",
    );
  });

  it("skips the self-domain check when no own hostname is configured", () => {
    expect(() => assertShortenable("https://short.example")).not.toThrow();
  });
});
