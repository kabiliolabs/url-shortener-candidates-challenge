import { describe, expect, it } from "vitest";
import { InvalidUrlError } from "../domain/errors";
import { SHORT_CODE_ALPHABET } from "../domain/short-code";
import { InMemoryShortenedUrlRepository } from "../test-support/in-memory-shortened-url-repository";
import { ShortenUrl } from "./shorten-url";

describe("ShortenUrl", () => {
  it("stores the destination and returns a short code", async () => {
    const repository = new InMemoryShortenedUrlRepository();
    const shortened = await new ShortenUrl(repository).execute("https://example.com/a");

    expect(shortened.destination.value).toBe("https://example.com/a");
    expect(shortened.clicks).toBe(0);
    expect(await repository.findByCode(shortened.code)).not.toBeNull();
  });

  /**
   * The original bug: a collision silently overwrote another user's link.
   * Here the repository rejects the duplicate and the use case retries, so two
   * different URLs can never share a code.
   */
  it("retries with a new code when the generated one is already taken", async () => {
    const repository = new InMemoryShortenedUrlRepository();

    // A randomness source that returns index 0 twice (producing a colliding
    // code) and then index 1, forcing exactly one retry.
    let call = 0;
    const randomInt = () => (call++ < 7 ? 0 : 1);

    const first = await new ShortenUrl(repository, randomInt).execute("https://example.com/one");
    const second = await new ShortenUrl(repository, randomInt).execute("https://example.com/two");

    expect(first.code.value).toBe(SHORT_CODE_ALPHABET[0]!.repeat(7));
    expect(second.code.value).toBe(SHORT_CODE_ALPHABET[1]!.repeat(7));
    expect(first.code.value).not.toBe(second.code.value);
    expect(repository.rows.size).toBe(2);
    // The first link still points where it did: nothing was overwritten.
    expect((await repository.findByCode(first.code))?.destination.value).toBe(
      "https://example.com/one",
    );
  });

  it("is idempotent: the same destination reuses the existing short link", async () => {
    const repository = new InMemoryShortenedUrlRepository();
    const useCase = new ShortenUrl(repository);

    const first = await useCase.execute("https://example.com/same");
    const second = await useCase.execute("https://example.com/same");

    expect(second.code.value).toBe(first.code.value);
    expect(repository.rows.size).toBe(1);
  });

  it("rejects invalid input before touching the repository", async () => {
    const repository = new InMemoryShortenedUrlRepository();
    await expect(new ShortenUrl(repository).execute("javascript:alert(1)")).rejects.toThrow(
      InvalidUrlError,
    );
    expect(repository.rows.size).toBe(0);
  });
});
