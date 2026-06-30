import { describe, expect, it } from "vitest";
import { OriginalUrl } from "./original-url";
import { InvalidUrlError } from "../errors";

describe("OriginalUrl", () => {
  it("accepts an https URL and normalizes it", () => {
    expect(OriginalUrl.create("https://example.com/path?q=1").value).toBe(
      "https://example.com/path?q=1",
    );
  });

  it.each([
    "javascript:alert(1)",
    "data:text/html,<h1>x</h1>",
    "file:///etc/passwd",
    "not a url",
  ])("rejects %s", (raw) => {
    expect(() => OriginalUrl.create(raw)).toThrow(InvalidUrlError);
  });
});
