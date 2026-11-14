import { describe, expect, it, vi } from "vitest";
import { ShortenedURL } from "../../domain/shortened-url";
import { Err, Ok } from "../../../../shared/types/result";
import { ShortenURLUseCase } from "./shorten-url";

function fixture(codes = ["NewCode001"], failureAt = -1) {
  const records = new Map([["aa", "https://existing.example/path"]]);
  const generate = vi.fn(() => codes[generate.mock.calls.length - 1]);
  const insert = vi.fn(async (link: ShortenedURL) => {
    if (insert.mock.calls.length === failureAt)
      return Err({ code: "storage_unavailable" as const });
    if (records.has(link.code)) return Err({ code: "code_conflict" as const });
    records.set(link.code, link.destination.value);
    return Ok(undefined);
  });
  const findByCode = vi.fn();
  return {
    useCase: new ShortenURLUseCase({ generate }, { insert, findByCode }),
    generate,
    insert,
    records,
  };
}

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
    async (input, code, message) => {
      const { useCase, generate, insert, records } = fixture();
      const entries = [...records];

      expect(await useCase.execute(input)).toEqual({
        ok: false,
        error: { code, message },
      });
      expect([...records]).toEqual(entries);
      expect(generate).not.toHaveBeenCalled();
      expect(insert).not.toHaveBeenCalled();
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
    async (destination) => {
      const { useCase, records } = fixture();
      const result = await useCase.execute(`  ${destination}  `);

      expect(result.ok).toBe(true);
      if (!result.ok) throw new Error("Expected a successful shortening");
      expect(result.value).toBeInstanceOf(ShortenedURL);
      expect(result.value.code).toBe("NewCode001");
      expect(result.value.destination.value).toBe(destination);
      expect([...records]).toEqual([
        ["aa", "https://existing.example/path"],
        ["NewCode001", destination],
      ]);
    },
  );

  it.each([0, 1, 2, 3])(
    "allows exactly three attempts with %i conflicts",
    async (collisions) => {
      const candidates = [
        "Conflict01",
        "Conflict02",
        "Conflict03",
        "Forbidden4",
      ];
      const { useCase, records, generate, insert } = fixture(candidates);
      for (let i = 0; i < collisions; i++)
        records.set(candidates[i], `https://existing.example/${i}`);
      const before = [...records];
      const result = await useCase.execute("https://new.example/path");
      const attempts = Math.min(collisions + 1, 3);
      expect(generate).toHaveBeenCalledTimes(attempts);
      expect(insert).toHaveBeenCalledTimes(attempts);
      for (const [code, destination] of before)
        expect(records.get(code)).toBe(destination);
      if (collisions === 3) {
        expect(result).toEqual(
          Err({
            code: "code_exhausted",
            message: "Could not create a short link. Please try again.",
          }),
        );
        expect([...records]).toEqual(before);
      } else {
        expect(result.ok).toBe(true);
        if (!result.ok) throw new Error("Expected success");
        expect(result.value.code).toBe(candidates[collisions]);
        expect(records.get(result.value.code)).toBe("https://new.example/path");
        expect(records.size).toBe(before.length + 1);
      }
    },
  );

  it.each([1, 2])(
    "stops on storage failure at attempt %i",
    async (failureAt) => {
      const { useCase, records, generate, insert } = fixture(
        ["aa", "NewCode001"],
        failureAt,
      );
      const before = [...records];
      expect(await useCase.execute("https://example.com")).toEqual(
        Err({
          code: "storage_unavailable",
          message: "Service temporarily unavailable. Please try again.",
        }),
      );
      expect(insert).toHaveBeenCalledTimes(failureAt);
      expect(generate).toHaveBeenCalledTimes(failureAt);
      expect([...records]).toEqual(before);
    },
  );

  it("stores repeated destinations independently", async () => {
    const { useCase, records } = fixture(["NewCode001", "NewCode002"]);
    const first = await useCase.execute("https://example.com");
    const second = await useCase.execute("https://example.com");
    expect(
      first.ok && second.ok && first.value.code !== second.value.code,
    ).toBe(true);
    expect(records.get("NewCode001")).toBe("https://example.com");
    expect(records.get("NewCode002")).toBe("https://example.com");
  });
});
