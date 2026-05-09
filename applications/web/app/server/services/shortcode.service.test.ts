// @vitest-environment node
import { describe, it, expect } from "vitest";
import { generateShortCode, ALPHABET, CODE_LENGTH } from "./shortcode.service.server";

describe("shortcode service", () => {
  it("generates a code of correct length", () => {
    const code = generateShortCode();
    expect(code).toHaveLength(CODE_LENGTH);
    expect(CODE_LENGTH).toBe(10);
  });

  it("generates only base62 characters", () => {
    const code = generateShortCode();
    for (const char of code) {
      expect(ALPHABET).toContain(char);
    }
  });

  it("generates unique codes across multiple calls", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      codes.add(generateShortCode());
    }
    expect(codes.size).toBe(100);
  });
});
