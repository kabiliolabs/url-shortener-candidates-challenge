import { describe, it, expect } from "vitest";
import {
  generateShortCode,
  isValidShortCodeFormat,
  isCodeValidForLookup,
  SHORT_CODE_LENGTH,
  SHORT_CODE_ALPHABET,
} from "./short-code.server.js";

describe("short-code.server", () => {
  describe("isValidShortCodeFormat", () => {
    it("returns false for empty or wrong length", () => {
      expect(isValidShortCodeFormat("")).toBe(false);
      expect(isValidShortCodeFormat("abc")).toBe(false);
      expect(isValidShortCodeFormat("abcd12")).toBe(true); // 6 chars, all in alphabet
      expect(isValidShortCodeFormat("abcdefgh")).toBe(false);
    });

    it("returns true only when all chars are in SHORT_CODE_ALPHABET", () => {
      expect(isValidShortCodeFormat("a1B2c3")).toBe(true);
      expect(isValidShortCodeFormat("000000")).toBe(true);
      expect(isValidShortCodeFormat("ZZZZZZ")).toBe(true);
      expect(isValidShortCodeFormat("a-b-c-")).toBe(false);
      expect(isValidShortCodeFormat("a b c ")).toBe(false);
    });
  });

  describe("isCodeValidForLookup", () => {
    it("returns false for empty or invalid format", () => {
      expect(isCodeValidForLookup("")).toBe(false);
      expect(isCodeValidForLookup("ab")).toBe(false);
      expect(isCodeValidForLookup("invalid!")).toBe(false);
    });

    it("returns true for valid 6-char code from alphabet", () => {
      expect(isCodeValidForLookup("a1B2c3")).toBe(true);
      expect(isCodeValidForLookup("abcdef")).toBe(true);
    });
  });

  describe("generateShortCode", () => {
    it("returns a string of SHORT_CODE_LENGTH", () => {
      for (let i = 0; i < 10; i++) {
        const code = generateShortCode();
        expect(code).toHaveLength(SHORT_CODE_LENGTH);
      }
    });

    it("returns only characters from SHORT_CODE_ALPHABET", () => {
      const allowed = new Set(SHORT_CODE_ALPHABET);
      for (let i = 0; i < 20; i++) {
        const code = generateShortCode();
        expect([...code].every((c) => allowed.has(c))).toBe(true);
      }
    });

    it("passes isValidShortCodeFormat", () => {
      for (let i = 0; i < 10; i++) {
        expect(isValidShortCodeFormat(generateShortCode())).toBe(true);
      }
    });
  });
});
