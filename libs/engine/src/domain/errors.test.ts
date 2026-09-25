import { describe, expect, it } from "vitest";
import {
  InvalidUrlError,
  ShortCodeCollisionError,
  ShortCodeExhaustedError,
  ShortUrlNotFoundError,
} from "./errors";

describe("domain error types", () => {
  it("InvalidUrlError is an Error with a distinguishable name", () => {
    const err = new InvalidUrlError("bad url");
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("InvalidUrlError");
    expect(err.message).toBe("bad url");
  });

  it("ShortCodeExhaustedError is an Error with a distinguishable name", () => {
    const err = new ShortCodeExhaustedError();
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ShortCodeExhaustedError");
  });

  it("ShortUrlNotFoundError is an Error with a distinguishable name", () => {
    const err = new ShortUrlNotFoundError("abc1234");
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ShortUrlNotFoundError");
    expect(err.message).toContain("abc1234");
  });

  it("ShortCodeCollisionError is an Error with a distinguishable name", () => {
    const err = new ShortCodeCollisionError("abc1234");
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ShortCodeCollisionError");
  });

  it("all four error names are distinct", () => {
    const names = new Set([
      new InvalidUrlError("x").name,
      new ShortCodeExhaustedError().name,
      new ShortUrlNotFoundError("x").name,
      new ShortCodeCollisionError("x").name,
    ]);
    expect(names.size).toBe(4);
  });
});
