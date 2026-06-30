import { describe, expect, it } from "vitest";
import { ShortCode } from "./short-code";
import { InvalidShortCodeError } from "../errors";

describe("ShortCode", () => {
  it("accepts a base62 code", () => {
    expect(ShortCode.create("aZ09xY1").value).toBe("aZ09xY1");
  });

  it.each(["", "a/b", "abc-123"])("rejects %j", (raw) => {
    expect(() => ShortCode.create(raw)).toThrow(InvalidShortCodeError);
  });
});
