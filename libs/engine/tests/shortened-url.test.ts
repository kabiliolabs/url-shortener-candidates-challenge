import { describe, expect, it } from "vitest";
import { generateShortCode } from "../src/shortened-url";

describe("generateShortCode", () => {
  it("returns a string of length 2", () => {
    expect(generateShortCode()).toHaveLength(2);
  });

  it("uses only characters from the current alphabet (a–c)", () => {
    for (let i = 0; i < 20; i++) {
      expect(generateShortCode()).toMatch(/^[abc]{2}$/);
    }
  });
});
