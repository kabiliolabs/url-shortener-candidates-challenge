import { describe, expect, it } from "vitest";
import { validateAndNormalizeUrl, isPrivateHost } from "./url-validation";
import { InvalidUrlError } from "./errors";

describe("validateAndNormalizeUrl", () => {
  it("accepts and normalizes a valid https url", () => {
    expect(validateAndNormalizeUrl("https://example.com/path?q=1")).toBe(
      "https://example.com/path?q=1",
    );
  });

  it("accepts http", () => {
    expect(validateAndNormalizeUrl("http://example.com")).toBe(
      "http://example.com/",
    );
  });

  it("trims surrounding whitespace", () => {
    expect(validateAndNormalizeUrl("  https://example.com  ")).toBe(
      "https://example.com/",
    );
  });

  it("rejects empty input", () => {
    expect(() => validateAndNormalizeUrl("")).toThrow(InvalidUrlError);
  });

  it("rejects non-http(s) schemes", () => {
    expect(() => validateAndNormalizeUrl("javascript:alert(1)")).toThrow(
      InvalidUrlError,
    );
    expect(() => validateAndNormalizeUrl("data:text/html,x")).toThrow(
      InvalidUrlError,
    );
    expect(() => validateAndNormalizeUrl("ftp://example.com")).toThrow(
      InvalidUrlError,
    );
  });

  it("rejects malformed urls", () => {
    expect(() => validateAndNormalizeUrl("not a url")).toThrow(InvalidUrlError);
  });

  it("rejects urls over 2048 chars", () => {
    const long = "https://example.com/" + "a".repeat(2048);
    expect(() => validateAndNormalizeUrl(long)).toThrow(InvalidUrlError);
  });

  it("rejects private / internal hosts (anti-SSRF)", () => {
    for (const u of [
      "http://localhost",
      "http://127.0.0.1",
      "http://10.0.0.5",
      "http://172.16.0.1",
      "http://192.168.1.1",
      "http://169.254.169.254",
      "http://[::1]",
    ]) {
      expect(() => validateAndNormalizeUrl(u)).toThrow(InvalidUrlError);
    }
  });
});

describe("isPrivateHost", () => {
  it("flags loopback and private ranges", () => {
    expect(isPrivateHost("localhost")).toBe(true);
    expect(isPrivateHost("127.0.0.1")).toBe(true);
    expect(isPrivateHost("10.1.2.3")).toBe(true);
    expect(isPrivateHost("192.168.0.1")).toBe(true);
    expect(isPrivateHost("::1")).toBe(true);
  });

  it("allows public hosts", () => {
    expect(isPrivateHost("example.com")).toBe(false);
    expect(isPrivateHost("8.8.8.8")).toBe(false);
  });
});
