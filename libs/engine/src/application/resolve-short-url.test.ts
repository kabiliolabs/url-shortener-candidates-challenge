import { describe, expect, it } from "vitest";
import { ShortUrlNotFound } from "../domain/errors";
import { OriginalUrl } from "../domain/original-url";
import { InMemoryShortUrlRepository } from "../infrastructure/in-memory-short-url-repository";
import { ResolveShortUrl } from "./resolve-short-url";

describe("ResolveShortUrl", () => {
  it("returns the original URL and counts one click per resolution", async () => {
    const repository = new InMemoryShortUrlRepository();
    await repository.create(
      "abc1234",
      OriginalUrl.create("https://example.com/page", []),
    );
    const resolveShortUrl = new ResolveShortUrl(repository);

    const first = await resolveShortUrl.execute("abc1234");
    await resolveShortUrl.execute("abc1234");

    expect(first).toBe("https://example.com/page");
    expect(await repository.list(10)).toMatchObject([
      { code: "abc1234", clicks: 2 },
    ]);
  });

  it("fails with ShortUrlNotFound for an unknown code", async () => {
    const resolveShortUrl = new ResolveShortUrl(
      new InMemoryShortUrlRepository(),
    );

    await expect(resolveShortUrl.execute("missing")).rejects.toThrow(
      ShortUrlNotFound,
    );
  });
});
