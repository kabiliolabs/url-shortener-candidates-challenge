import { describe, expect, it } from "vitest";
import { generateShortCode } from "./short-code";

describe("generateShortCode", () => {
  it("returns a code of the requested length", () => {
    expect(generateShortCode({ length: 7 })).toHaveLength(7);
    expect(generateShortCode({ length: 10 })).toHaveLength(10);
  });

  it("defaults to length 7", () => {
    expect(generateShortCode()).toHaveLength(7);
  });

  it("only uses characters from the base62 alphabet", () => {
    const code = generateShortCode({ length: 100 });
    expect(code).toMatch(/^[0-9A-Za-z]+$/);
  });

  it("uses the injected randomness deterministically", () => {
    // bytes 0,1,2 -> first three alphabet chars: 0,1,2
    const randomBytes = (size: number) =>
      Uint8Array.from({ length: size }, (_, i) => i);
    expect(generateShortCode({ length: 3, randomBytes })).toBe("012");
  });

  it("avoids modulo bias by rejecting out-of-range bytes", () => {
    // alphabet length 62; bytes >= 248 (4*62) would bias -> must be skipped.
    // Provide 250 (rejected), then 0 -> first char should be alphabet[0] = "0".
    const queue = [250, 0];
    let idx = 0;
    const randomBytes = (size: number) =>
      Uint8Array.from({ length: size }, () => queue[idx++ % queue.length]);
    expect(generateShortCode({ length: 1, randomBytes })).toBe("0");
  });

  it("produces distinct codes across many calls", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 1000; i++) seen.add(generateShortCode());
    expect(seen.size).toBe(1000);
  });
});
