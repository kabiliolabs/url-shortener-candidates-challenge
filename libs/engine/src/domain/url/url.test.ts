import { describe, expect, it } from "vitest";
import { URL } from "./url";

describe("URL.safeParse", () => {
  it.each([
    "https://example.com/article?ref=test#section",
    "http://example.com",
    "http://localhost:3000/page",
    "http://192.168.1.10/page",
    "http://[::1]:3000/page",
    "https://EXAMPLE.com:443/a/../path?ref=%61#section",
  ])("accepts %s without canonicalizing its text", (value) => {
    const result = URL.safeParse(value);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.value).toBe(value);
  });

  it("trims surrounding whitespace and compares values by their remaining text", () => {
    const parsed = URL.safeParse("  https://example.com/path  ");
    const same = URL.safeParse("https://example.com/path");
    const different = URL.safeParse("https://example.com/other");
    const canonicalEquivalent = URL.safeParse("https://EXAMPLE.com/path");
    if (!parsed.ok || !same.ok || !different.ok || !canonicalEquivalent.ok) {
      throw new Error("Expected valid URL fixtures");
    }
    expect(parsed.value.value).toBe("https://example.com/path");
    expect(parsed.value.equals(same.value)).toBe(true);
    expect(parsed.value.equals(different.value)).toBe(false);
    expect(parsed.value.equals(canonicalEquivalent.value)).toBe(false);
    expect(Reflect.set(parsed.value, "value", "javascript:alert(1)")).toBe(
      false,
    );
    expect(parsed.value.value).toBe("https://example.com/path");
  });

  it.each([
    ["", "required"],
    [" \n\t ", "required"],
    ["example.com", "invalid_url"],
    ["https://", "invalid_url"],
    ["https://exa mple.com", "invalid_url"],
    ["https:example.com", "invalid_url"],
    ["https:/example.com", "invalid_url"],
    ["ftp://example.com", "unsupported_protocol"],
    ["javascript:alert(1)", "unsupported_protocol"],
  ])("rejects %j with %s without throwing", (input, code) => {
    const result = URL.safeParse(input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(code);
      expect(result.error.message).toEqual(expect.any(String));
      expect(result.error.message.length).toBeGreaterThan(0);
      expect(result.error).not.toHaveProperty("status");
      expect(result.error).not.toHaveProperty("field");
      if (code === "required") {
        expect(result.error.message).toBe("URL is required");
      }
    }
  });
});

// These checks are compiled by the engine test typecheck, never executed.
function checkCreationAndMutation(value: URL, unvalidated: unknown) {
  // @ts-expect-error The caller must narrow untrusted input to a string.
  URL.safeParse(unvalidated);
  // @ts-expect-error Missing input must be rejected at the application boundary.
  URL.safeParse(undefined);
  // @ts-expect-error Null input must be rejected at the application boundary.
  URL.safeParse(null);
  // @ts-expect-error Non-string input is outside the value object's contract.
  URL.safeParse(123);
  // @ts-expect-error Uploaded files must be rejected by the HTTP adapter.
  URL.safeParse(new File(["https://example.com"], "url.txt"));
  // @ts-expect-error URL construction must go through safeParse.
  new URL("https://example.com");
  // @ts-expect-error A validated destination is read-only.
  value.value = "javascript:alert(1)";
}
void checkCreationAndMutation;
