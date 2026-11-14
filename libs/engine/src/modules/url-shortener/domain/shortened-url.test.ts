import { describe, expect, it } from "vitest";
import { URL } from "../../../shared/value-objects/url";
import { ShortenedURL } from "./shortened-url";

describe("ShortenedURL", () => {
  it("retains a read-only code and validated destination", () => {
    const destination = URL.safeParse("https://example.com/path");
    if (!destination.ok) throw new Error("Expected a valid destination");

    const result = ShortenedURL.create("ab", destination.value);
    if (!result.ok) throw new Error("Expected valid shortened URL");
    const shortened = result.value;

    expect(shortened.code).toBe("ab");
    expect(shortened.destination).toBe(destination.value);
    expect(Reflect.set(shortened, "code", "cc")).toBe(false);
    expect(Reflect.set(shortened, "destination", "invalid")).toBe(false);
    expect(shortened.code).toBe("ab");
    expect(shortened.destination.value).toBe("https://example.com/path");
  });

  it.each(["sftp://example.com/file", "ftp://example.com", "mailto:person@example.com", "javascript:alert(1)"])(
    "rejects a valid generic URL with an unsupported protocol: %s",
    (input) => {
      const destination = URL.safeParse(input);
      if (!destination.ok) throw new Error("Expected a valid generic URL");
      const expected = {
        ok: false,
        error: { code: "unsupported_protocol", message: "Only http:// and https:// URLs are supported." },
      };
      expect(ShortenedURL.validateDestination(destination.value)).toEqual(expected);
      expect(ShortenedURL.create("ab", destination.value)).toEqual(expected);
    },
  );

  it.each(["https:example.com", "https:/example.com", "https:///example.com"])(
    "rejects parser-repaired HTTP syntax during aggregate creation: %s",
    (input) => {
      const destination = URL.safeParse(input);
      if (!destination.ok) throw new Error("Expected a parseable generic URL");
      expect(ShortenedURL.create("ab", destination.value)).toEqual({
        ok: false,
        error: { code: "invalid_url", message: "Enter a complete, valid URL starting with http:// or https://." },
      });
    },
  );
});

function checkTypes(shortened: ShortenedURL) {
  // @ts-expect-error Aggregate creation must enforce its destination policy.
  new ShortenedURL("ab", shortened.destination);
  // @ts-expect-error The entity accepts validated URLs, not raw strings.
  new ShortenedURL("ab", "https://example.com");
  // @ts-expect-error Entity identity is read-only.
  shortened.code = "cc";
  // @ts-expect-error Entity destination is read-only.
  shortened.destination = URL.safeParse("https://example.com");
}
void checkTypes;
