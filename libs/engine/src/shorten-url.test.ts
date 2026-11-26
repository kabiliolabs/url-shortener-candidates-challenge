import { describe, expect, it } from "vitest";
import { shortenUrl } from "./shorten-url";
import { InMemoryShortLinkRepository } from "./testing/in-memory-short-link-repository";

describe("shortenUrl", () => {
  it("returns the same code when the same URL is shortened twice", async () => {
    const repository = new InMemoryShortLinkRepository();

    const first = await shortenUrl(repository, "https://example.com");
    const second = await shortenUrl(repository, "https://example.com");

    expect(first.ok).toBe(true);
    expect(second).toEqual(first);
  });

  it("returns the error for an invalid URL", async () => {
    const repository = new InMemoryShortLinkRepository();

    const result = await shortenUrl(repository, "not a url");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe(
        "Enter a valid URL including http:// or https://.",
      );
    }
  });
});
