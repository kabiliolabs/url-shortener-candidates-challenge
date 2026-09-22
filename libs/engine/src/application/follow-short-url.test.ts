import { describe, expect, it, vi } from "vitest";
import { InMemoryShortUrlRepository } from "../testing/in-memory-short-url-repository";
import { FollowShortUrl } from "./follow-short-url";

async function repositoryWithLink() {
  const repository = new InMemoryShortUrlRepository();
  await repository.create({ shortCode: "aB3xK9q", originalUrl: "https://example.com/" });
  return repository;
}

describe("FollowShortUrl", () => {
  it("returns the original URL and counts every click", async () => {
    const repository = await repositoryWithLink();
    const clock = [1, 2, 3].map((minute) => new Date(Date.UTC(2026, 0, 2, 0, minute)));
    const followShortUrl = new FollowShortUrl(repository, vi.fn(), () => clock.shift()!);

    for (let i = 0; i < 3; i++) {
      expect(await followShortUrl.execute("aB3xK9q")).toBe("https://example.com/");
    }

    const shortUrl = repository.rows.get("aB3xK9q")!;
    expect(shortUrl.clicks).toBe(3);
    expect(shortUrl.lastClickedAt).toEqual(new Date(Date.UTC(2026, 0, 2, 0, 3)));
  });

  it("still redirects and reports the error when recording the click fails", async () => {
    const repository = await repositoryWithLink();
    const writeFailure = new Error("could not obtain lock");
    vi.spyOn(repository, "recordClick").mockRejectedValue(writeFailure);
    const reportError = vi.fn();

    const originalUrl = await new FollowShortUrl(repository, reportError).execute("aB3xK9q");

    expect(originalUrl).toBe("https://example.com/");
    await vi.waitFor(() => expect(reportError).toHaveBeenCalledWith(writeFailure, "aB3xK9q"));
  });

  it("does not wait for the click to be recorded before redirecting", async () => {
    const repository = await repositoryWithLink();
    vi.spyOn(repository, "recordClick").mockReturnValue(new Promise(() => {}));

    await expect(new FollowShortUrl(repository, vi.fn()).execute("aB3xK9q")).resolves.toBe(
      "https://example.com/",
    );
  });

  it("returns null for an unknown code without recording a click", async () => {
    const repository = await repositoryWithLink();
    const recordClick = vi.spyOn(repository, "recordClick");

    expect(await new FollowShortUrl(repository, vi.fn()).execute("zzzzzzz")).toBeNull();
    expect(recordClick).not.toHaveBeenCalled();
    expect(repository.rows.get("aB3xK9q")!.clicks).toBe(0);
  });

  it("propagates failures to resolve the link, since there is nothing to redirect to", async () => {
    const repository = await repositoryWithLink();
    const outage = new Error("connection refused");
    vi.spyOn(repository, "findByCode").mockRejectedValue(outage);

    await expect(new FollowShortUrl(repository, vi.fn()).execute("aB3xK9q")).rejects.toBe(outage);
  });

  it("treats codes as case-sensitive", async () => {
    const repository = await repositoryWithLink();

    expect(await new FollowShortUrl(repository, vi.fn()).execute("ab3xk9q")).toBeNull();
  });

  it.each(["bad!", "", "aB3xK9qq", "../etc"])(
    "returns null for malformed code %j without querying the repository",
    async (code) => {
      const repository = new InMemoryShortUrlRepository();
      const findByCode = vi.spyOn(repository, "findByCode");

      expect(await new FollowShortUrl(repository, vi.fn()).execute(code)).toBeNull();
      expect(findByCode).not.toHaveBeenCalled();
    },
  );
});
