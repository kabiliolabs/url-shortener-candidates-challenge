import { describe, expect, it } from "vitest";
import { InvalidUrlError } from "./errors";
import { OriginalUrl } from "./original-url";

const BLOCKED_HOSTS = ["sho.rt"];

function rejection(raw: string): unknown {
  try {
    OriginalUrl.create(raw, BLOCKED_HOSTS);
  } catch (error) {
    return error;
  }
  throw new Error(`Expected "${raw.slice(0, 40)}" to be rejected`);
}

function expectRejected(raw: string, message: string) {
  const error = rejection(raw);
  expect(error).toBeInstanceOf(InvalidUrlError);
  expect((error as InvalidUrlError).message).toBe(message);
}

describe("OriginalUrl", () => {
  it("trims the input and stores the normalised URL", () => {
    const originalUrl = OriginalUrl.create(
      "  HTTPS://Example.com/path?q=1  ",
      BLOCKED_HOSTS,
    );

    expect(originalUrl.value).toBe("https://example.com/path?q=1");
  });

  it("rejects an empty input, including whitespace only", () => {
    expectRejected("", "Enter a URL.");
    expectRejected("   ", "Enter a URL.");
  });

  it("rejects an input longer than 2048 characters", () => {
    const prefix = "https://example.com/";
    const atLimit = prefix + "a".repeat(2048 - prefix.length);

    expect(() => OriginalUrl.create(atLimit, BLOCKED_HOSTS)).not.toThrow();
    expectRejected(
      atLimit + "a",
      "The URL is too long (maximum 2048 characters).",
    );
  });

  it("rejects an input that is not a URL", () => {
    expectRejected(
      "example.com/path",
      "That doesn't look like a valid URL. Include http:// or https://.",
    );
  });

  it("rejects protocols other than http and https", () => {
    const message = "Only http and https URLs can be shortened.";

    expectRejected("javascript:alert(1)", message);
    expectRejected("ftp://example.com/file", message);
  });

  it("rejects a blocked host, whatever its casing", () => {
    const message = "URLs from this site can't be shortened.";

    expectRejected("https://sho.rt/s/abc1234", message);
    expectRejected("HTTPS://SHO.RT/", message);
  });
});
