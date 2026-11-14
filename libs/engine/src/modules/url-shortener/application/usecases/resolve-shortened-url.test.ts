import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { shortenedUrls } from "../../shortened-url";
import { ResolveShortenedURLUseCase } from "./resolve-shortened-url";

const resolveShortenedURL = new ResolveShortenedURLUseCase();
let originalEntries: [string, string][];
let entries: [string, string][];

beforeEach(() => {
  originalEntries = [...shortenedUrls];
  shortenedUrls.clear();
  shortenedUrls.set("aa", "https://existing.example/path");
  shortenedUrls.set(
    "Custom-42",
    "https://EXAMPLE.com:443/a/../path?ref=%61#section",
  );
  entries = [...shortenedUrls];
  vi.spyOn(Math, "random");
});

afterEach(() => {
  const finalEntries = [...shortenedUrls];
  const generationCalls = vi.mocked(Math.random).mock.calls.length;
  shortenedUrls.clear();
  for (const [code, destination] of originalEntries) {
    shortenedUrls.set(code, destination);
  }
  vi.restoreAllMocks();
  expect(finalEntries).toEqual(entries);
  expect(generationCalls).toBe(0);
});

describe("ResolveShortenedURLUseCase", () => {
  it.each([
    undefined,
    null,
    123,
    { code: "aa" },
    new File(["aa"], "code.txt"),
    "",
    " \n\t ",
  ])("rejects invalid code %j", (input) => {
    expect(resolveShortenedURL.execute(input)).toEqual({
      ok: false,
      error: { code: "invalid_code", message: "Invalid short code" },
    });
  });

  it.each([
    ["aa", "https://existing.example/path"],
    ["Custom-42", "https://EXAMPLE.com:443/a/../path?ref=%61#section"],
  ])("returns the exact stored destination for %s", (code, destination) => {
    expect(resolveShortenedURL.execute(code)).toEqual({
      ok: true,
      value: destination,
    });
  });

  it.each(["missing", " aa ", "AA", "custom-42"])(
    "does not normalize or guess an unknown code %j",
    (code) => {
      expect(resolveShortenedURL.execute(code)).toEqual({
        ok: false,
        error: { code: "not_found", message: "Not Found" },
      });
    },
  );
});
