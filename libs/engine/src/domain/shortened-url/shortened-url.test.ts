import { describe, expect, it } from "vitest";
import { URL } from "../url/url";
import { ShortenedURL } from "./shortened-url";

describe("ShortenedURL", () => {
  it("retains a read-only code and validated destination", () => {
    const destination = URL.safeParse("https://example.com/path");
    if (!destination.ok) throw new Error("Expected a valid destination");

    const shortened = new ShortenedURL("ab", destination.value);

    expect(shortened.code).toBe("ab");
    expect(shortened.destination).toBe(destination.value);
    expect(Reflect.set(shortened, "code", "cc")).toBe(false);
    expect(Reflect.set(shortened, "destination", "invalid")).toBe(false);
    expect(shortened.code).toBe("ab");
    expect(shortened.destination.value).toBe("https://example.com/path");
  });
});

function checkTypes(shortened: ShortenedURL) {
  // @ts-expect-error The entity accepts validated URLs, not raw strings.
  new ShortenedURL("ab", "https://example.com");
  // @ts-expect-error Entity identity is read-only.
  shortened.code = "cc";
  // @ts-expect-error Entity destination is read-only.
  shortened.destination = URL.safeParse("https://example.com");
}
void checkTypes;
