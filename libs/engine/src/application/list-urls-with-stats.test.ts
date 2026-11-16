import { describe, expect, it } from "vitest";
import { ListUrlsWithStats, MAX_PAGE_SIZE } from "./list-urls-with-stats";
import { InMemoryUrlRepository } from "../infrastructure/in-memory-url-repository";
import { ShortUrl } from "../domain/short-url";

async function repositoryWith(count: number) {
  const repository = new InMemoryUrlRepository();
  for (let i = 0; i < count; i++) {
    await repository.save(
      new ShortUrl({ code: `c${i}`, originalUrl: `https://example.com/${i}` }),
    );
  }
  return repository;
}

describe("ListUrlsWithStats", () => {
  it("returns an empty page when no URLs have been shortened", async () => {
    const useCase = new ListUrlsWithStats(new InMemoryUrlRepository());

    expect(await useCase.execute()).toEqual({
      urls: [],
      limit: 20,
      offset: 0,
      nextOffset: null,
    });
  });

  it("returns saved ShortUrls with their stats", async () => {
    const repository = new InMemoryUrlRepository();
    const shortUrl = new ShortUrl({ code: "ab", originalUrl: "https://example.com" });
    shortUrl.recordClick();
    await repository.save(shortUrl);

    const { urls } = await new ListUrlsWithStats(repository).execute();

    expect(urls).toEqual([shortUrl]);
    expect(urls[0].clickCount).toBe(1);
  });

  it("bounds the page and points at the next one", async () => {
    const useCase = new ListUrlsWithStats(await repositoryWith(5));

    const firstPage = await useCase.execute({ limit: 2 });
    const lastPage = await useCase.execute({ limit: 2, offset: 4 });

    expect(firstPage.urls.map((url) => url.code)).toEqual(["c4", "c3"]);
    expect(firstPage.nextOffset).toBe(2);
    expect(lastPage.urls.map((url) => url.code)).toEqual(["c0"]);
    expect(lastPage.nextOffset).toBeNull();
  });

  it("caps the limit and falls back to defaults for invalid input", async () => {
    const useCase = new ListUrlsWithStats(new InMemoryUrlRepository());

    expect((await useCase.execute({ limit: 10_000 })).limit).toBe(MAX_PAGE_SIZE);
    expect(await useCase.execute({ limit: Number.NaN, offset: -3 })).toMatchObject({
      limit: 20,
      offset: 0,
    });
  });
});
