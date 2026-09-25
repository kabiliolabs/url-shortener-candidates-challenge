import { describe, expect, it } from "vitest";
import { generateShortCode } from "./short-url";

describe("generateShortCode", () => {
  it("generates a code of length 7", () => {
    expect(generateShortCode()).toHaveLength(7);
  });

  it("only uses base62 characters", () => {
    const code = generateShortCode();
    expect(code).toMatch(/^[0-9A-Za-z]{7}$/);
  });

  it("generates varying codes across many calls", () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateShortCode()));
    expect(codes.size).toBeGreaterThan(1);
  });
});
