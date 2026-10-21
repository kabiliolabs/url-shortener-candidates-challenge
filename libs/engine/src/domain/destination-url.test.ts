import { describe, expect, it } from "vitest";
import { DestinationUrl } from "./destination-url";
import { InvalidUrlError } from "./errors";

describe("DestinationUrl", () => {
  it("accepts http and https links", () => {
    expect(DestinationUrl.parse("https://example.com/path?a=1").value).toBe(
      "https://example.com/path?a=1",
    );
    expect(DestinationUrl.parse("http://example.com").value).toBe("http://example.com/");
  });

  it("assumes https when the scheme is omitted", () => {
    expect(DestinationUrl.parse("example.com/docs").value).toBe("https://example.com/docs");
  });

  // The security-critical case: these used to be stored verbatim and then
  // rendered into an <a href> / handed to redirect(), i.e. stored XSS.
  it.each(["javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "file:///etc/passwd"])(
    "rejects the dangerous scheme in %s",
    (dangerous) => {
      expect(() => DestinationUrl.parse(dangerous)).toThrow(InvalidUrlError);
    },
  );

  it("rejects empty input, whitespace and non-strings", () => {
    for (const invalid of ["", "   ", null, undefined, 42]) {
      expect(() => DestinationUrl.parse(invalid)).toThrow(InvalidUrlError);
    }
  });

  it("rejects hosts without a dot, which are almost always typos", () => {
    expect(() => DestinationUrl.parse("htps://example")).toThrow(InvalidUrlError);
  });

  it("rejects URLs longer than 2048 characters", () => {
    expect(() => DestinationUrl.parse(`https://example.com/${"a".repeat(2100)}`)).toThrow(
      InvalidUrlError,
    );
  });
});
