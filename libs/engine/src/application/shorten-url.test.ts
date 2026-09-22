import { describe, expect, it, vi } from "vitest";
import { ShortCodeGenerationError } from "../domain/errors";
import { UrlValidationError } from "../domain/original-url";
import { InMemoryShortUrlRepository } from "../testing/in-memory-short-url-repository";
import { ShortenUrl } from "./shorten-url";

const PUBLIC_URL = "http://localhost:3000";

function sequence(...codes: string[]) {
  let index = 0;
  return () => codes[index++]!;
}

describe("ShortenUrl", () => {
  it("stores the normalized URL under a new code", async () => {
    const repository = new InMemoryShortUrlRepository();
    const shortUrl = await new ShortenUrl(repository, PUBLIC_URL).execute(
      "  HTTPS://Example.COM/page ",
    );

    expect(shortUrl.originalUrl).toBe("https://example.com/page");
    expect(shortUrl.shortCode).toMatch(/^[0-9A-Za-z]{7}$/);
    expect(shortUrl.clicks).toBe(0);
    expect(shortUrl.lastClickedAt).toBeNull();
    expect(repository.rows.get(shortUrl.shortCode)?.originalUrl).toBe(
      "https://example.com/page",
    );
  });

  it("rejects invalid input without touching the repository", async () => {
    const repository = new InMemoryShortUrlRepository();
    const create = vi.spyOn(repository, "create");

    await expect(
      new ShortenUrl(repository, PUBLIC_URL).execute("javascript:alert(1)"),
    ).rejects.toBeInstanceOf(UrlValidationError);
    expect(create).not.toHaveBeenCalled();
  });

  it("retries with a new code when the generated one is taken", async () => {
    const repository = new InMemoryShortUrlRepository();
    await repository.create({ shortCode: "taken00", originalUrl: "https://a.com/" });

    const shortUrl = await new ShortenUrl(
      repository,
      PUBLIC_URL,
      sequence("taken00", "taken00", "fresh00"),
    ).execute("https://b.com");

    expect(shortUrl.shortCode).toBe("fresh00");
    expect(repository.rows.get("taken00")?.originalUrl).toBe("https://a.com/");
  });

  it("gives up after 5 collisions without storing anything", async () => {
    const repository = new InMemoryShortUrlRepository();
    await repository.create({ shortCode: "taken00", originalUrl: "https://a.com/" });
    const alwaysTaken = vi.fn(() => "taken00");

    await expect(
      new ShortenUrl(repository, PUBLIC_URL, alwaysTaken).execute("https://b.com"),
    ).rejects.toBeInstanceOf(ShortCodeGenerationError);
    expect(alwaysTaken).toHaveBeenCalledTimes(5);
    expect(repository.rows.size).toBe(1);
  });

  it("rethrows repository errors other than a taken code", async () => {
    const repository = new InMemoryShortUrlRepository();
    const outage = new Error("connection refused");
    const create = vi.spyOn(repository, "create").mockRejectedValue(outage);

    await expect(
      new ShortenUrl(repository, PUBLIC_URL).execute("https://b.com"),
    ).rejects.toBe(outage);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("creates a separate link each time the same URL is shortened", async () => {
    const repository = new InMemoryShortUrlRepository();
    const shortenUrl = new ShortenUrl(repository, PUBLIC_URL);

    const first = await shortenUrl.execute("https://example.com");
    const second = await shortenUrl.execute("https://example.com");

    expect(first.shortCode).not.toBe(second.shortCode);
    expect(repository.rows.size).toBe(2);
  });
});
