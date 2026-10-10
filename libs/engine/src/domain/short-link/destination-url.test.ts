import { describe, expect, it } from "vitest";
import { InvalidDestinationUrlError } from "../errors/invalid-destination-url.error";
import { DestinationUrl } from "./destination-url";

describe("DestinationUrl", () => {
  it.each([
    ["https://example.com", "https://example.com/"],
    ["http://example.com/a?b=1#c", "http://example.com/a?b=1#c"],
    ["  https://example.com/path  ", "https://example.com/path"],
    ["HTTPS://EXAMPLE.com", "https://example.com/"],
  ])("accepts and normalizes %j", (input, expected) => {
    expect(DestinationUrl.create(input).value).toBe(expected);
  });

  it.each([
    ["empty", ""],
    ["whitespace", "   "],
    ["relative string", "hola"],
    ["missing scheme", "example.com"],
    ["javascript scheme", "javascript:alert(1)"],
    ["data scheme", "data:text/html;base64,PHNjcmlwdD4="],
    ["ftp scheme", "ftp://example.com/file"],
    ["file scheme", "file:///etc/passwd"],
    ["no hostname", "http://"],
    ["credentials with host lookalike", "https://google.com@evil.com"],
    ["credentials with password", "https://user:pass@example.com"],
    ["embedded tab", "https://exa\tmple.com"],
    ["embedded newline", "https://example.com/a\nb"],
    ["null byte", "https://example.com/\u0000"],
    ["single-label host", "http://a"],
    ["localhost", "http://localhost:3000/admin"],
    ["intranet host", "http://jira/browse/X-1"],
    ["IPv4 literal", "http://192.168.0.1/apply.cgi"],
    ["loopback IPv4", "http://127.0.0.1:8080"],
    ["IPv6 literal", "http://[::1]/"],
    ["public IPv6 literal", "http://[2001:db8::1]:8080/x"],
  ])("rejects %s", (_label, input) => {
    expect(() => DestinationUrl.create(input)).toThrow(InvalidDestinationUrlError);
  });

  it.each([
    ["https://münchen.de", "https://xn--mnchen-3ya.de/"],
    ["HtTpS://Example.com", "https://example.com/"],
    ["https://example.com:443/a", "https://example.com/a"],
    ["http://example.com:80", "http://example.com/"],
    ["http://example.com:8080", "http://example.com:8080/"],
  ])("normalizes %j", (input, expected) => {
    expect(DestinationUrl.create(input).value).toBe(expected);
  });

  it("rejects urls that grow past the limit after normalization", () => {
    const input = `https://example.com/${"é".repeat(400)}`;
    expect(input.length).toBeLessThanOrEqual(DestinationUrl.MAX_LENGTH);
    expect(() => DestinationUrl.create(input)).toThrow(/too long/i);
  });

  it("does not echo the raw input in error messages", () => {
    for (const input of ["secret-input", "ftp://secret-host", "https://secret:pw@host.com"]) {
      expect(() => DestinationUrl.create(input)).toThrow(
        expect.objectContaining({ message: expect.not.stringContaining("secret") }),
      );
    }
  });

  it("keeps a previously stored destination even if it no longer passes validation", () => {
    const legacy = new DestinationUrl("ftp://legacy");

    expect(legacy.value).toBe("ftp://legacy");
  });

  it("rejects urls longer than the maximum length", () => {
    const tooLong = `https://example.com/${"a".repeat(DestinationUrl.MAX_LENGTH)}`;
    expect(() => DestinationUrl.create(tooLong)).toThrow(/too long/i);
  });

  it("accepts a url at exactly the maximum length", () => {
    const prefix = "https://example.com/";
    const exact = prefix + "a".repeat(DestinationUrl.MAX_LENGTH - prefix.length);
    expect(DestinationUrl.create(exact).value).toHaveLength(DestinationUrl.MAX_LENGTH);
  });

  it("gives specific messages", () => {
    expect(() => DestinationUrl.create("")).toThrow(/empty/i);
    expect(() => DestinationUrl.create("hola")).toThrow(/valid absolute url/i);
    expect(() => DestinationUrl.create("ftp://a.com")).toThrow(/http/i);
  });

  it("compares by normalized value", () => {
    const a = DestinationUrl.create("https://example.com");
    const b = DestinationUrl.create(" HTTPS://example.com/ ");
    expect(a.equals(b)).toBe(true);
    expect(String(a)).toBe("https://example.com/");
  });
});
