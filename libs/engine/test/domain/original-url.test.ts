import { describe, expect, it } from "vitest";
import { InvalidUrlError, OriginalUrl } from "../../src";

function reasonFor(raw: string) {
  try {
    OriginalUrl.create(raw);
  } catch (error) {
    if (error instanceof InvalidUrlError) return error.reason;
    throw error;
  }
  return "valid";
}

describe("SPEC-002: Validate the URL", () => {
  it("accepts http and https URLs", () => {
    expect(OriginalUrl.create("https://example.com/path?q=1").value).toBe(
      "https://example.com/path?q=1",
    );
    expect(OriginalUrl.create("http://example.com").value).toBe("http://example.com/");
  });

  it("trims the input", () => {
    expect(OriginalUrl.create("  https://example.com  ").value).toBe("https://example.com/");
  });

  it("adds https:// when there's no scheme", () => {
    expect(OriginalUrl.create("example.com/docs").value).toBe("https://example.com/docs");
    expect(OriginalUrl.create("localhost:8080").value).toBe("https://localhost:8080/");
  });

  it("rejects empty input", () => {
    expect(reasonFor("")).toBe("required");
    expect(reasonFor("   ")).toBe("required");
  });

  it.each(["javascript:alert(1)", "data:text/html,<h1>hi</h1>", "file:///etc/passwd", "ftp://example.com"])(
    "rejects non-http schemes: %s",
    (raw) => {
      expect(reasonFor(raw)).toBe("unsupported_scheme");
    },
  );

  it("rejects things that aren't real URLs", () => {
    expect(reasonFor("not a url")).toBe("malformed");
    expect(reasonFor("https://foo")).toBe("malformed");
  });

  it("rejects URLs longer than 2048 chars", () => {
    const long = `https://example.com/${"a".repeat(2048)}`;
    expect(reasonFor(long)).toBe("too_long");
  });

  it("knows its host, including the port", () => {
    const url = OriginalUrl.create("http://localhost:3000/s/abc");
    expect(url.hasHost("localhost:3000")).toBe(true);
    expect(url.hasHost("localhost:5173")).toBe(false);
  });
});
