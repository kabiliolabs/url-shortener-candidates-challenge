import { describe, expect, it } from "vitest";
import { DestinationUrl, MAX_URL_LENGTH } from "../../src/domain/destination-url";
import { InvalidDestinationUrlError } from "../../src/domain/errors";

describe("DestinationUrl", () => {
  it.each(["http://example.com", "https://example.com/path?value=1"])(
    "accepts a supported URL: %s",
    (value) => {
      expect(DestinationUrl.create(value).value).toBe(value);
    },
  );

  it("trims surrounding whitespace", () => {
    expect(DestinationUrl.create("  https://example.com/path  ").value).toBe(
      "https://example.com/path",
    );
  });

  it.each([
    ["", "URL is required."],
    ["example.com", "Please enter a valid URL, including https://."],
    ["ftp://example.com", "Only HTTP and HTTPS URLs are supported."],
  ])("rejects invalid input %#", (value, message) => {
    expect(() => DestinationUrl.create(value)).toThrowError(
      new InvalidDestinationUrlError(message),
    );
  });

  it("rejects URLs longer than the supported limit", () => {
    const value = `https://example.com/${"a".repeat(MAX_URL_LENGTH)}`;

    expect(() => DestinationUrl.create(value)).toThrowError(
      `URL must be ${MAX_URL_LENGTH} characters or less.`,
    );
  });
});
