import { describe, expect, it } from "vitest";
import {
  InvalidDestinationUrlError,
  normalizeDestinationUrl,
} from "../src/normalize-destination-url";

describe("normalizeDestinationUrl", () => {
  it.each([
    ["  HTTPS://Example.com/path  ", "https://example.com/path"],
    ["http://example.com", "http://example.com/"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeDestinationUrl(input)).toBe(expected);
  });

  it.each(["not-a-url", "javascript:alert(1)", "data:text/plain,hello"])(
    "rejects %s",
    (input) => {
      expect(() => normalizeDestinationUrl(input)).toThrow(
        InvalidDestinationUrlError,
      );
    },
  );
});
