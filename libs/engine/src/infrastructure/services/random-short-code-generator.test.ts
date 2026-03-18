import { describe, it, expect, vi } from "vitest";
import { RandomShortCodeGenerator } from "./random-short-code-generator";
import { ShortCode } from "../../domain/value-objects/short-code";

describe("RandomShortCodeGenerator", () => {
  const generator = new RandomShortCodeGenerator();

  it("generate returns a ShortCode instance", () => {
    expect(generator.generate()).toBeInstanceOf(ShortCode);
  });

  it("generated value matches the expected pattern", () => {
    for (let i = 0; i < 50; i++) {
      expect(generator.generate().value).toMatch(/^[a-z0-9]{7}$/);
    }
  });

  it("generates distinct codes across many calls", () => {
    const codes = new Set(Array.from({ length: 50 }, () => generator.generate().value));
    expect(codes.size).toBeGreaterThan(1);
  });

  it("uses Math.random to build the code", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0);
    const code = generator.generate();
    expect(code.value).toBe("aaaaaaa");
    spy.mockRestore();
  });
});
