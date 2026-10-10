import { describe, expect, it } from "vitest";

import { withDefaultScheme } from "./with-default-scheme";

describe("withDefaultScheme", () => {
  it.each([
    ["www.google.com", "https://www.google.com"],
    ["google.com/search?q=url", "https://google.com/search?q=url"],
    ["example.com:8080/path", "https://example.com:8080/path"],
    ["localhost:3000", "https://localhost:3000"],
    ["  www.google.com  ", "https://www.google.com"],
  ])("adds https to %j", (input, expected) => {
    expect(withDefaultScheme(input)).toBe(expected);
  });

  it.each([
    "http://example.com",
    "https://example.com",
    "HTTPS://example.com",
    "ftp://example.com",
    "javascript:alert(1)",
    "mailto:someone@example.com",
    "example.com:abc",
  ])("keeps the scheme the user typed in %j", (input) => {
    expect(withDefaultScheme(input)).toBe(input);
  });

  it("leaves empty input empty so the domain reports it", () => {
    expect(withDefaultScheme("   ")).toBe("");
  });
});
