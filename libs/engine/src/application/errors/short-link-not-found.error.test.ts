import { describe, expect, it } from "vitest";
import { ShortCode } from "../../domain";
import { ApplicationError } from "./application-error";
import { ShortLinkNotFoundError } from "./short-link-not-found.error";

describe("ShortLinkNotFoundError", () => {
  it("is an application error that carries the code", () => {
    const code = ShortCode.create("aaaaaaa");
    const error = new ShortLinkNotFoundError(code);
    expect(error).toBeInstanceOf(ApplicationError);
    expect(error.name).toBe("ShortLinkNotFoundError");
    expect(error.code.equals(code)).toBe(true);
    expect(error.message).toContain("aaaaaaa");
  });
});
