import { describe, expect, it } from "vitest";
import { ShortCode } from "../../domain";
import { CryptoShortCodeGenerator } from "./crypto-short-code.generator";

describe("CryptoShortCodeGenerator", () => {
  it("generates valid short codes of the expected length over the alphabet", () => {
    const shortCodeGenerator = new CryptoShortCodeGenerator();

    for (let i = 0; i < 50; i++) {
      const shortCode = shortCodeGenerator.generate();

      expect(shortCode).toBeInstanceOf(ShortCode);
      expect(shortCode.value).toHaveLength(ShortCode.LENGTH);
      expect([...shortCode.value].every((char) => ShortCode.ALPHABET.includes(char))).toBe(true);
    }
  });

  it("maps the injected indexes to the matching alphabet characters", () => {
    const queue = [0, ShortCode.ALPHABET.length - 1, 1, 2, 3, 4, 5];
    const nextIndex = () => {
      const index = queue.shift();
      if (index === undefined) throw new Error("index queue exhausted");
      return index;
    };
    const shortCodeGenerator = new CryptoShortCodeGenerator(nextIndex);

    const shortCode = shortCodeGenerator.generate();

    const { ALPHABET } = ShortCode;
    const expected = `${ALPHABET[0]}${ALPHABET.at(-1)}${ALPHABET.slice(1, 6)}`;
    expect(shortCode.equals(ShortCode.create(expected))).toBe(true);
  });

  it("asks the random source for indexes bounded by the alphabet length", () => {
    const bounds: number[] = [];
    const shortCodeGenerator = new CryptoShortCodeGenerator((max) => {
      bounds.push(max);
      return 0;
    });

    shortCodeGenerator.generate();

    expect(bounds).toEqual(Array(ShortCode.LENGTH).fill(ShortCode.ALPHABET.length));
  });

});
