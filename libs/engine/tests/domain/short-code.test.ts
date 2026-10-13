import { describe, expect, it } from "vitest";
import { InvalidShortCodeError } from "../../src/domain/errors";
import { ShortCode } from "../../src/domain/short-code";

describe("ShortCode", () => {
  it.each(["aB3_-xY9", "12345678"])("accepts a URL-safe code: %s", (value) => {
    expect(ShortCode.create(value).value).toBe(value);
  });

  it.each(["", "short", "has space", "123456789", "inv@lid!"])(
    "rejects an invalid code: %s",
    (value) => {
      expect(() => ShortCode.create(value)).toThrow(InvalidShortCodeError);
    },
  );
});
