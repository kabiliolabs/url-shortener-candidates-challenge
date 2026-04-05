import { describe, expect, it } from "vitest";
import { generateShortCode, SHORT_CODE_LENGTH } from "../src/shortened-url";

const codePattern = new RegExp(`^[A-Za-z0-9_-]{${SHORT_CODE_LENGTH}}$`);

describe("generateShortCode", () => {
  it(`returns a string of length ${SHORT_CODE_LENGTH}`, () => {
    expect(generateShortCode()).toHaveLength(SHORT_CODE_LENGTH);
  });

  it("uses only characters from nanoid's URL-safe alphabet", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateShortCode()).toMatch(codePattern);
    }
  });

  it("produces distinct codes across many invocations", () => {
    const codes = new Set(Array.from({ length: 200 }, () => generateShortCode()));
    expect(codes.size).toBe(200);
  });
});
