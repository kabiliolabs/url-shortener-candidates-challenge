import { describe, expect, it } from "vitest";
import { generateShortCode, isValidShortCode } from "./short-code";

describe("generateShortCode", () => {
  it("produces 7 base62 characters", () => {
    for (let i = 0; i < 1000; i++) {
      expect(generateShortCode()).toMatch(/^[0-9A-Za-z]{7}$/);
    }
  });

  it("does not repeat across many generations", () => {
    const codes = new Set(Array.from({ length: 10_000 }, generateShortCode));
    expect(codes.size).toBe(10_000);
  });
});

describe("isValidShortCode", () => {
  it.each(["aB3xK9q", "0000000", "zzzzzzz"])("accepts %s", (code) => {
    expect(isValidShortCode(code)).toBe(true);
  });

  it.each(["", "abc", "aB3xK9qq", "aB3-K9q", "aB3_K9q", "aB3/K9q", "aB3 K9q"])(
    "rejects %j",
    (code) => {
      expect(isValidShortCode(code)).toBe(false);
    },
  );
});
