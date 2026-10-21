import { describe, expect, it } from "vitest";
import { InvalidShortCodeError } from "./errors";
import { ShortCode, SHORT_CODE_ALPHABET, SHORT_CODE_LENGTH } from "./short-code";

describe("ShortCode", () => {
  it("generates codes of the expected length from the expected alphabet", () => {
    const code = ShortCode.random();
    expect(code.value).toHaveLength(SHORT_CODE_LENGTH);
    for (const char of code.value) {
      expect(SHORT_CODE_ALPHABET).toContain(char);
    }
  });

  it("is deterministic when the randomness source is injected", () => {
    // Proves generation is testable, unlike the original Math.random() version.
    const alwaysFirst = () => 0;
    expect(ShortCode.random(alwaysFirst).value).toBe(SHORT_CODE_ALPHABET[0]!.repeat(SHORT_CODE_LENGTH));
  });

  it("has enough entropy to make collisions negligible", () => {
    // The original generator had 9 possible codes (3^2); this one has 56^7.
    const combinations = SHORT_CODE_ALPHABET.length ** SHORT_CODE_LENGTH;
    expect(combinations).toBeGreaterThan(1e12);
  });

  it("rejects codes with characters outside the alphabet", () => {
    expect(() => ShortCode.parse("abc!def")).toThrow(InvalidShortCodeError);
    expect(() => ShortCode.parse("")).toThrow(InvalidShortCodeError);
    expect(() => ShortCode.parse("l1O0")).toThrow(InvalidShortCodeError);
  });
});
