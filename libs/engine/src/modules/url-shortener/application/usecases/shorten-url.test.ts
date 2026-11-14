import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ShortenedURL } from "../../domain/shortened-url";
import { shortenedUrls } from "../../shortened-url";
import { ShortenURLUseCase } from "./shorten-url";

const shortenURL = new ShortenURLUseCase();
let originalEntries: [string, string][];

beforeEach(() => {
  originalEntries = [...shortenedUrls];
  shortenedUrls.clear();
  shortenedUrls.set("aa", "https://existing.example/path");
});

afterEach(() => {
  shortenedUrls.clear();
  for (const [code, destination] of originalEntries) {
    shortenedUrls.set(code, destination);
  }
  vi.restoreAllMocks();
});

describe("ShortenURLUseCase", () => {
  it.each([
    [undefined, "required", "URL is required"],
    [null, "required", "URL is required"],
    ["", "required", "URL is required"],
    [" \n\t ", "required", "URL is required"],
    [
      123,
      "invalid_url",
      "Enter a complete, valid URL starting with http:// or https://.",
    ],
    [
      { url: "https://example.com" },
      "invalid_url",
      "Enter a complete, valid URL starting with http:// or https://.",
    ],
    [
      new File(["https://example.com"], "url.txt"),
      "invalid_url",
      "Enter a complete, valid URL starting with http:// or https://.",
    ],
    [
      "example.com",
      "invalid_url",
      "Enter a complete, valid URL starting with http:// or https://.",
    ],
    [
      "https://",
      "invalid_url",
      "Enter a complete, valid URL starting with http:// or https://.",
    ],
    [
      "https://exa mple.com",
      "invalid_url",
      "Enter a complete, valid URL starting with http:// or https://.",
    ],
    [
      "ftp://example.com",
      "unsupported_protocol",
      "Only http:// and https:// URLs are supported.",
    ],
    [
      "javascript:alert(1)",
      "unsupported_protocol",
      "Only http:// and https:// URLs are supported.",
    ],
    [
      "sftp://example.com/file",
      "unsupported_protocol",
      "Only http:// and https:// URLs are supported.",
    ],
    [
      "mailto:person@example.com",
      "unsupported_protocol",
      "Only http:// and https:// URLs are supported.",
    ],
    [
      "ftp://",
      "unsupported_protocol",
      "Only http:// and https:// URLs are supported.",
    ],
    [
      "sftp://",
      "unsupported_protocol",
      "Only http:// and https:// URLs are supported.",
    ],
    [
      "https:example.com",
      "invalid_url",
      "Enter a complete, valid URL starting with http:// or https://.",
    ],
    [
      "https:/example.com",
      "invalid_url",
      "Enter a complete, valid URL starting with http:// or https://.",
    ],
  ] as const)(
    "rejects %j without generating or storing a code",
    (input, code, message) => {
      const entries = [...shortenedUrls];
      const random = vi.spyOn(Math, "random");

      expect(shortenURL.execute(input)).toEqual({
        ok: false,
        error: { code, message },
      });
      expect([...shortenedUrls]).toEqual(entries);
      expect(random).not.toHaveBeenCalled();
    },
  );

  it.each([
    "https://example.com/article?ref=test#section",
    "http://example.com",
    "http://localhost:3000/page",
    "http://192.168.1.10/page",
    "http://[::1]:3000/page",
    "https://EXAMPLE.com:443/a/../path?ref=%61#section",
  ])(
    "creates and stores the trimmed destination %s without canonicalization",
    (destination) => {
      vi.spyOn(Math, "random").mockReturnValue(0.4);
      const result = shortenURL.execute(`  ${destination}  `);

      expect(result.ok).toBe(true);
      if (!result.ok) throw new Error("Expected a successful shortening");
      expect(result.value).toBeInstanceOf(ShortenedURL);
      expect(result.value.code).toBe("bb");
      expect(result.value.destination.value).toBe(destination);
      expect([...shortenedUrls]).toEqual([
        ["aa", "https://existing.example/path"],
        ["bb", destination],
      ]);
    },
  );

  it("preserves existing overwrite behavior when a generated code already exists", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const result = shortenURL.execute("https://replacement.example");

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected a successful shortening");
    expect(result.value.code).toBe("aa");
    expect([...shortenedUrls]).toEqual([["aa", "https://replacement.example"]]);
  });
});
