import { ShortCode } from "@url-shortener/engine";
import { describe, expect, it } from "vitest";
import { CryptoShortCodeGenerator } from "../src";

describe("SPEC-003: Unique short codes (CryptoShortCodeGenerator)", () => {
  const generator = new CryptoShortCodeGenerator();

  it("generates valid 7-char base62 codes", () => {
    for (let i = 0; i < 100; i++) {
      expect(ShortCode.isValid(generator.generate().value)).toBe(true);
    }
  });

  it("doesn't repeat itself in practice", () => {
    const codes = new Set(Array.from({ length: 10_000 }, () => generator.generate().value));
    expect(codes.size).toBe(10_000);
  });
});
