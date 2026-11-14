import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ShortenedURL } from "../../domain/shortened-url";
import { Err, Ok } from "../../../../shared/types/result";
import type { ShortenerRepository } from "../ports/shortener-repository";
import { ResolveShortenedURLUseCase } from "./resolve-shortened-url";

const records = new Map([
  ["aa", "https://existing.example/path"],
  ["Custom-42", "https://EXAMPLE.com:443/a/../path?ref=%61#section"],
]);
const findByCode = vi.fn<ShortenerRepository["findByCode"]>(async (code) => {
  const raw = records.get(code);
  if (raw === undefined) return Ok(null);
  const destination = ShortenedURL.parseDestination(raw);
  if (!destination.ok) throw new Error("Invalid fixture");
  const link = ShortenedURL.create(code, destination.value);
  if (!link.ok) throw new Error("Invalid fixture");
  return link;
});
const insert = vi.fn();
const resolveShortenedURL = new ResolveShortenedURLUseCase({
  findByCode,
  insert,
});
beforeEach(() => vi.clearAllMocks());
afterEach(() => expect(insert).not.toHaveBeenCalled());
describe("ResolveShortenedURLUseCase", () => {
  it.each([
    undefined,
    null,
    123,
    { code: "aa" },
    new File(["aa"], "code.txt"),
    "",
    " \n\t ",
  ])("rejects invalid code %j", async (input) => {
    expect(await resolveShortenedURL.execute(input)).toEqual({
      ok: false,
      error: { code: "invalid_code", message: "Invalid short code" },
    });
    expect(findByCode).not.toHaveBeenCalled();
  });

  it.each([
    ["aa", "https://existing.example/path"],
    ["Custom-42", "https://EXAMPLE.com:443/a/../path?ref=%61#section"],
  ])(
    "returns the exact stored destination for %s",
    async (code, destination) => {
      expect(await resolveShortenedURL.execute(code)).toEqual({
        ok: true,
        value: destination,
      });
    },
  );

  it.each(["missing", " aa ", "AA", "custom-42"])(
    "does not normalize or guess an unknown code %j",
    async (code) => {
      expect(await resolveShortenedURL.execute(code)).toEqual({
        ok: false,
        error: { code: "not_found", message: "Not Found" },
      });
    },
  );
  it("distinguishes unavailable storage from a missing record", async () => {
    findByCode.mockResolvedValueOnce(Err({ code: "storage_unavailable" }));
    expect(await resolveShortenedURL.execute("aa")).toEqual(
      Err({
        code: "storage_unavailable",
        message: "Service temporarily unavailable. Please try again.",
      }),
    );
    expect(findByCode).toHaveBeenCalledExactlyOnceWith("aa");
  });
});
