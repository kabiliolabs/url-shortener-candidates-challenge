import { describe, expect, it } from "vitest";

import { InvalidShortCodeError } from "./errors";
import { ShortCode } from "./short-code";

describe("ShortCode.parse", () => {
  it("accepts a 7-char alphanumeric code", () => {
    const code = ShortCode.parse("aB3_X-z");
    expect(code.value).toBe("aB3_X-z");
    expect(code.toString()).toBe("aB3_X-z");
  });

  it("rejects codes that are too short", () => {
    expect(() => ShortCode.parse("abc")).toThrow(InvalidShortCodeError);
  });

  it("rejects codes that are too long", () => {
    expect(() => ShortCode.parse("abcdefgh")).toThrow(InvalidShortCodeError);
  });

  it("rejects codes with illegal characters", () => {
    expect(() => ShortCode.parse("abc!def")).toThrow(InvalidShortCodeError);
    expect(() => ShortCode.parse("abc def")).toThrow(InvalidShortCodeError);
  });
});

describe("ShortCode.fromTrusted", () => {
  it("bypasses validation", () => {
    expect(() => ShortCode.fromTrusted("anything")).not.toThrow();
  });
});
