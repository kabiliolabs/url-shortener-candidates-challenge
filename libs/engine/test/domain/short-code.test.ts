import { describe, expect, it } from "vitest";
import { InvalidShortCodeError, ShortCode } from "../../src";

describe("SPEC-003: Unique short codes (format)", () => {
  it("accepts 7 base62 chars", () => {
    expect(ShortCode.create("aZ09xYz").value).toBe("aZ09xYz");
  });

  it.each(["", "abc", "abcdefgh", "abc-def", "abc def", "ñandú12"])(
    "rejects %j",
    (value) => {
      expect(ShortCode.isValid(value)).toBe(false);
      expect(() => ShortCode.create(value)).toThrow(InvalidShortCodeError);
    },
  );
});
