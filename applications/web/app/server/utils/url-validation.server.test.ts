import { describe, it, expect } from "vitest";
import { ValidationError } from "../errors.js";
import { URL_MAX_LENGTH } from "../constants.js";
import {
  isValidHttpUrl,
  normalizeStringInput,
  validateUrlInput,
} from "./url-validation.server.js";

describe("url-validation.server", () => {
  describe("isValidHttpUrl", () => {
    it("returns true for http and https URLs", () => {
      expect(isValidHttpUrl("http://example.com")).toBe(true);
      expect(isValidHttpUrl("https://example.com")).toBe(true);
      expect(isValidHttpUrl("https://sub.example.com/path?q=1")).toBe(true);
    });

    it("returns false for non-http(s) or invalid", () => {
      expect(isValidHttpUrl("ftp://example.com")).toBe(false);
      expect(isValidHttpUrl("file:///tmp")).toBe(false);
      expect(isValidHttpUrl("not a url")).toBe(false);
      expect(isValidHttpUrl("")).toBe(false);
    });
  });

  describe("normalizeStringInput", () => {
    it("trims strings and returns empty for non-strings", () => {
      expect(normalizeStringInput("  https://x.com  ")).toBe("https://x.com");
      expect(normalizeStringInput(123)).toBe("");
      expect(normalizeStringInput(null)).toBe("");
      expect(normalizeStringInput(undefined)).toBe("");
    });
  });

  describe("validateUrlInput", () => {
    it("throws ValidationError for empty string", () => {
      expect(() => validateUrlInput("")).toThrow(ValidationError);
      expect(() => validateUrlInput("   ")).toThrow(ValidationError);
    });

    it("throws ValidationError when URL exceeds max length", () => {
      const long = "https://a.com/" + "x".repeat(URL_MAX_LENGTH);
      expect(() => validateUrlInput(long)).toThrow(ValidationError);
    });

    it("throws ValidationError for non-http(s) URLs", () => {
      expect(() => validateUrlInput("ftp://example.com")).toThrow(ValidationError);
      expect(() => validateUrlInput("example.com")).toThrow(ValidationError);
    });

    it("does not throw for valid http/https URLs", () => {
      expect(() => validateUrlInput("http://example.com")).not.toThrow();
      expect(() => validateUrlInput("https://example.com/path")).not.toThrow();
    });
  });
});
