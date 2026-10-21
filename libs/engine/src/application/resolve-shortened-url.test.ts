import { describe, expect, it } from "vitest";
import { ShortenedUrlNotFoundError } from "../domain/errors";
import { InMemoryShortenedUrlRepository } from "../test-support/in-memory-shortened-url-repository";
import { ResolveShortenedUrl } from "./resolve-shortened-url";
import { ShortenUrl } from "./shorten-url";

describe("ResolveShortenedUrl", () => {
  it("returns the destination and counts the click", async () => {
    const repository = new InMemoryShortenedUrlRepository();
    const created = await new ShortenUrl(repository).execute("https://example.com/target");
    const resolve = new ResolveShortenedUrl(repository);

    const first = await resolve.execute(created.code.value);
    expect(first.destination.value).toBe("https://example.com/target");
    expect(first.clicks).toBe(1);

    await resolve.execute(created.code.value);
    const stats = await repository.stats();
    expect(stats.totalClicks).toBe(2);
  });

  it("reports unknown and malformed codes the same way (no information leak)", async () => {
    const resolve = new ResolveShortenedUrl(new InMemoryShortenedUrlRepository());

    await expect(resolve.execute("aaaaaaa")).rejects.toThrow(ShortenedUrlNotFoundError);
    await expect(resolve.execute("not-a-code!")).rejects.toThrow(ShortenedUrlNotFoundError);
    await expect(resolve.execute(undefined)).rejects.toThrow(ShortenedUrlNotFoundError);
  });
});
