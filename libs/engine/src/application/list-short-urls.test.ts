import { describe, expect, it } from "vitest";
import { InMemoryShortUrlRepository } from "../testing/in-memory-short-url-repository";
import { ListShortUrls } from "./list-short-urls";

describe("ListShortUrls", () => {
  it("lists links newest first", async () => {
    const repository = new InMemoryShortUrlRepository();
    for (const shortCode of ["first00", "second0", "third00"]) {
      await repository.create({ shortCode, originalUrl: "https://example.com/" });
    }

    const shortUrls = await new ListShortUrls(repository).execute();

    expect(shortUrls.map((shortUrl) => shortUrl.shortCode)).toEqual([
      "third00",
      "second0",
      "first00",
    ]);
  });

  it("returns an empty list when there are no links", async () => {
    expect(await new ListShortUrls(new InMemoryShortUrlRepository()).execute()).toEqual([]);
  });
});
