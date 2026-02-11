import { describe, expect, it } from "vitest";
import { toBase62 } from "./base62";

describe("toBase62", () => {
  it("returns a non-empty string", () => {
    expect(toBase62(1)).toBeTypeOf("string");
    expect(toBase62(1).length).toBeGreaterThan(0);
  });

  it("is deterministic", () => {
    expect(toBase62(12345)).toBe(toBase62(12345));
  });

  it("generates different outputs for different ids", () => {
    expect(toBase62(1)).not.toBe(toBase62(2));
    expect(toBase62(999)).not.toBe(toBase62(1000));
  });

  it("only uses base62 characters (0-9a-zA-Z)", () => {
    const out = toBase62(987654321);
    expect(out).toMatch(/^[0-9a-zA-Z]+$/);
  });

  it("handles large ids", () => {
    const out = toBase62(Number.MAX_SAFE_INTEGER);
    expect(out).toMatch(/^[0-9a-zA-Z]+$/);
  });
});
