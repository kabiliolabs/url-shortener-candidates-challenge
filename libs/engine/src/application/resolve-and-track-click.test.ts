import { describe, expect, it, vi } from "vitest";
import { ResolveAndTrackClick } from "./resolve-and-track-click";
import { InMemoryUrlRepository } from "../infrastructure/in-memory-url-repository";
import { ShortUrl } from "../domain/short-url";
import { ShortUrlNotFoundError } from "../domain/errors";

describe("ResolveAndTrackClick", () => {
  it("returns the ShortUrl and increments its click count when found", async () => {
    const repository = new InMemoryUrlRepository();
    const shortUrl = new ShortUrl({ code: "ab", originalUrl: "https://example.com" });
    await repository.save(shortUrl);
    const useCase = new ResolveAndTrackClick(repository);

    const result = await useCase.execute("ab");

    expect(result.originalUrl).toBe("https://example.com");
    expect(result.clickCount).toBe(1);
    expect((await repository.findByCode("ab"))?.clickCount).toBe(1);
  });

  it("delegates to the repository's atomic increment exactly once per resolution", async () => {
    const repository = new InMemoryUrlRepository();
    await repository.save(new ShortUrl({ code: "ab", originalUrl: "https://example.com" }));
    const incrementClicks = vi.spyOn(repository, "incrementClicks");
    const save = vi.spyOn(repository, "save");
    const useCase = new ResolveAndTrackClick(repository);

    await useCase.execute("ab");

    expect(incrementClicks).toHaveBeenCalledTimes(1);
    expect(incrementClicks).toHaveBeenCalledWith("ab");
    expect(save).not.toHaveBeenCalled();
  });

  it("throws ShortUrlNotFoundError when the code is not found", async () => {
    const repository = new InMemoryUrlRepository();
    const useCase = new ResolveAndTrackClick(repository);

    await expect(useCase.execute("zz")).rejects.toThrow(ShortUrlNotFoundError);
  });
});
