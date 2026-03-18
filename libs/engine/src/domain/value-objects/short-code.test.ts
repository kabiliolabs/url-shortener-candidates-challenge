import { describe, it, expect } from "vitest";
import { ShortCode } from "./short-code";

describe("ShortCode", () => {
  it("accepts a valid 7-char lowercase alphanumeric string", () => {
    const code = new ShortCode("abc1234");
    expect(code.value).toBe("abc1234");
  });

  it("accepts all numbers", () => {
    expect(() => new ShortCode("1234567")).not.toThrow();
  });

  it("accepts all lowercase letters", () => {
    expect(() => new ShortCode("abcdefg")).not.toThrow();
  });

  it("throws for a string shorter than 7 chars", () => {
    expect(() => new ShortCode("abc")).toThrow('Invalid ShortCode: "abc"');
  });

  it("throws for a string longer than 7 chars", () => {
    expect(() => new ShortCode("abcdefgh")).toThrow();
  });

  it("throws for an empty string", () => {
    expect(() => new ShortCode("")).toThrow();
  });

  it("throws for uppercase characters", () => {
    expect(() => new ShortCode("ABC1234")).toThrow();
  });

  it("throws for special characters", () => {
    expect(() => new ShortCode("abc-123")).toThrow();
  });

  it("equals returns true for same value", () => {
    expect(new ShortCode("abc1234").equals(new ShortCode("abc1234"))).toBe(true);
  });

  it("equals returns false for different value", () => {
    expect(new ShortCode("abc1234").equals(new ShortCode("xyz9876"))).toBe(false);
  });

  it("toString returns the value", () => {
    expect(new ShortCode("abc1234").toString()).toBe("abc1234");
  });
});
