import { describe, expect, it } from "vitest";
import { InvalidUrlError } from "./errors";
import { validateUrl } from "./url-validator";

describe("validateUrl", () => {
  it("accepts a well-formed https URL", () => {
    expect(validateUrl("https://example.com/path")).toBe(
      "https://example.com/path",
    );
  });

  it("accepts a well-formed http URL", () => {
    expect(validateUrl("http://example.com")).toBe("http://example.com/");
  });

  it("rejects a javascript: URL", () => {
    expect(() => validateUrl("javascript:alert(1)")).toThrow(InvalidUrlError);
  });

  it("rejects a data: URL", () => {
    expect(() => validateUrl("data:text/plain,hi")).toThrow(InvalidUrlError);
  });

  it("rejects an unparseable string", () => {
    expect(() => validateUrl("not a url")).toThrow(InvalidUrlError);
  });

  it("rejects an empty string", () => {
    expect(() => validateUrl("")).toThrow(InvalidUrlError);
  });

  it("rejects a URL exceeding the max length", () => {
    const huge = "https://example.com/" + "a".repeat(2050);
    expect(() => validateUrl(huge)).toThrow(InvalidUrlError);
  });
});
