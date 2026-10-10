import { describe, expect, it } from "vitest";
import { InvalidShortCodeError } from "../errors/invalid-short-code.error";
import { ShortCode } from "./short-code";

describe("ShortCode", () => {
  it("accepts a 7 character base62 value", () => {
    expect(ShortCode.create("aB3dE9z").value).toBe("aB3dE9z");
  });

  it("exposes length and alphabet for generators", () => {
    expect(ShortCode.LENGTH).toBe(7);
    expect(ShortCode.ALPHABET).toHaveLength(62);
    expect(new Set(ShortCode.ALPHABET).size).toBe(62);
  });

  it.each(["", "abc", "abcdefgh", "abc-efg", "abc_efg", "abc efg", "abcdéfg", " abcdef"])(
    "rejects %j",
    (value) => {
      expect(() => ShortCode.create(value)).toThrow(InvalidShortCodeError);
    },
  );

  it("keeps a previously stored code even if it no longer passes validation", () => {
    const legacy = new ShortCode("legacy-code");

    expect(legacy.value).toBe("legacy-code");
  });

  it("does not echo the raw input in error messages", () => {
    expect(() => ShortCode.create("secret")).toThrow(
      expect.objectContaining({ message: expect.not.stringContaining("secret") }),
    );
  });

  it("compares by value", () => {
    expect(ShortCode.create("aaaaaaa").equals(ShortCode.create("aaaaaaa"))).toBe(true);
    expect(ShortCode.create("aaaaaaa").equals(ShortCode.create("aaaaaab"))).toBe(false);
  });

  it("stringifies to its value", () => {
    expect(String(ShortCode.create("aaaaaaa"))).toBe("aaaaaaa");
  });
});
