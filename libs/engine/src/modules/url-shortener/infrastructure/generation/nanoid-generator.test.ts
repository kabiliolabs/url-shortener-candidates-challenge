// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { customAlphabet } from "nanoid";
import { NanoIDShortCodeGenerator } from "./nanoid-generator";

vi.mock("nanoid", async (importOriginal) => {
  const actual = await importOriginal<typeof import("nanoid")>();
  return { ...actual, customAlphabet: vi.fn(actual.customAlphabet) };
});

describe("NanoIDShortCodeGenerator", () => {
  it("uses the secure custom alphabet with exactly ten characters", () => {
    expect(customAlphabet).toHaveBeenCalledExactlyOnceWith(
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
      10,
    );
    expect(new NanoIDShortCodeGenerator().generate()).toMatch(
      /^[0-9A-Za-z]{10}$/,
    );
  });
});
