import { describe, it, expect } from "vitest";
import { ShortCode } from "./short-code";

describe("ShortCode.generate", () => {
  it("generates a code of length 7", () => {
    const code = ShortCode.generate();
    expect(code.value).toHaveLength(7);
  });

  it("generates only alphanumeric characters", () => {
    const code = ShortCode.generate();
    expect(code.value).toMatch(/^[a-zA-Z0-9]+$/);
  });

  it("generates unique codes", () => {
    const codes = new Set(Array.from({ length: 100 }, () => ShortCode.generate().value));
    expect(codes.size).toBe(100);
  });
});

describe("ShortCode.from", () => {
  it("creates a code from a valid string", () => {
    const code = ShortCode.from("abc1234");
    expect(code.value).toBe("abc1234");
  });

  it("trims whitespace", () => {
    const code = ShortCode.from("  abc1234  ");
    expect(code.value).toBe("abc1234");
  });

  it("throws when value is empty", () => {
    expect(() => ShortCode.from("")).toThrow("Short code cannot be empty");
  });

  it("throws when value is only whitespace", () => {
    expect(() => ShortCode.from("   ")).toThrow("Short code cannot be empty");
  });
});

describe("ShortCode.toString", () => {
  it("returns the code string", () => {
    const code = ShortCode.from("abc1234");
    expect(code.toString()).toBe("abc1234");
  });
});
