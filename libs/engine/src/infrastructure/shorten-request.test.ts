import { describe, expect, it } from "vitest";
import { assertShortenable, MAX_URL_LENGTH } from "../domain/assert-shortenable";
import { InvalidUrlError } from "../domain/errors";
import { createShortenRequestSchema, parseShortenRequest } from "./shorten-request";

const OWN_HOSTNAME = "short.example";
const schema = createShortenRequestSchema(OWN_HOSTNAME);

function predicateReason(url: string): string {
  try {
    assertShortenable(url, OWN_HOSTNAME);
  } catch (error) {
    return (error as Error).message;
  }
  throw new Error(`expected ${url} to be rejected`);
}

describe("shorten request schema", () => {
  it("parses a valid request", () => {
    expect(schema.parse({ url: "https://example.com" })).toEqual({
      url: "https://example.com",
    });
  });

  it.each([
    "",
    "javascript:alert(1)",
    "ftp://example.com/file",
    "not a url",
    "https://short.example/s/abc",
    `https://example.com/${"a".repeat(MAX_URL_LENGTH)}`,
  ])("rejects %j with the domain predicate's reason", (url) => {
    const result = schema.safeParse({ url });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(predicateReason(url));
  });

  it("parseShortenRequest maps a failed parse to InvalidUrlError", () => {
    expect(() => parseShortenRequest({}, schema)).toThrow(
      new InvalidUrlError("URL is required"),
    );
    expect(() => parseShortenRequest({ url: "ftp://x.com" }, schema)).toThrow(
      InvalidUrlError,
    );
  });
});
