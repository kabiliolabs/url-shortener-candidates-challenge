import { describe, expect, it, vi } from "vitest";
import { InMemoryShortUrlRepository } from "../testing/in-memory-short-url-repository";
import { FollowShortUrl } from "./follow-short-url";

describe("FollowShortUrl", () => {
  it("returns the original URL and counts every click", async () => {
    const repository = new InMemoryShortUrlRepository();
    await repository.create({ shortCode: "aB3xK9q", originalUrl: "https://example.com/" });
    const clock = [1, 2, 3].map((minute) => new Date(Date.UTC(2026, 0, 2, 0, minute)));
    const followShortUrl = new FollowShortUrl(repository, () => clock.shift()!);

    for (let i = 0; i < 3; i++) {
      expect(await followShortUrl.execute("aB3xK9q")).toBe("https://example.com/");
    }

    const shortUrl = repository.rows.get("aB3xK9q")!;
    expect(shortUrl.clicks).toBe(3);
    expect(shortUrl.lastClickedAt).toEqual(new Date(Date.UTC(2026, 0, 2, 0, 3)));
  });

  it("returns null for an unknown code without changing any counts", async () => {
    const repository = new InMemoryShortUrlRepository();
    await repository.create({ shortCode: "aB3xK9q", originalUrl: "https://example.com/" });

    expect(await new FollowShortUrl(repository).execute("zzzzzzz")).toBeNull();
    expect(repository.rows.get("aB3xK9q")!.clicks).toBe(0);
  });

  it("treats codes as case-sensitive", async () => {
    const repository = new InMemoryShortUrlRepository();
    await repository.create({ shortCode: "aB3xK9q", originalUrl: "https://example.com/" });

    expect(await new FollowShortUrl(repository).execute("ab3xk9q")).toBeNull();
  });

  it.each(["bad!", "", "aB3xK9qq", "../etc"])(
    "returns null for malformed code %j without querying the repository",
    async (code) => {
      const repository = new InMemoryShortUrlRepository();
      const recordClick = vi.spyOn(repository, "recordClick");

      expect(await new FollowShortUrl(repository).execute(code)).toBeNull();
      expect(recordClick).not.toHaveBeenCalled();
    },
  );
});
