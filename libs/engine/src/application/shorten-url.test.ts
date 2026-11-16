import { describe, expect, it } from "vitest";
import { CodeGenerationFailed, InvalidUrlError } from "../domain/errors";
import { OriginalUrl } from "../domain/original-url";
import type { ShortCodeGenerator } from "../domain/short-code-generator";
import { InMemoryShortUrlRepository } from "../infrastructure/in-memory-short-url-repository";
import { ShortenUrl } from "./shorten-url";

// Returns the given codes in order and then keeps repeating the last one, so a
// test decides exactly when a collision happens.
class SequenceCodeGenerator implements ShortCodeGenerator {
  calls = 0;

  constructor(private readonly codes: string[]) {}

  generate(): string {
    const code = this.codes[Math.min(this.calls, this.codes.length - 1)];
    this.calls++;
    return code;
  }
}

function setup(codes: string[]) {
  const repository = new InMemoryShortUrlRepository();
  const generator = new SequenceCodeGenerator(codes);
  const shortenUrl = new ShortenUrl(repository, generator, ["sho.rt"]);
  return { repository, generator, shortenUrl };
}

async function occupy(repository: InMemoryShortUrlRepository, code: string) {
  await repository.create(
    code,
    OriginalUrl.create("https://example.com/existing", []),
  );
}

describe("ShortenUrl", () => {
  it("stores the URL under a generated code", async () => {
    const { repository, shortenUrl } = setup(["abc1234"]);

    const shortUrl = await shortenUrl.execute("https://example.com/page");

    expect(shortUrl).toMatchObject({
      code: "abc1234",
      originalUrl: "https://example.com/page",
      clicks: 0,
    });
    expect(await repository.list(10)).toEqual([shortUrl]);
  });

  it("rejects an invalid URL without generating a code or storing anything", async () => {
    const { repository, generator, shortenUrl } = setup(["abc1234"]);

    await expect(shortenUrl.execute("javascript:alert(1)")).rejects.toThrow(
      InvalidUrlError,
    );

    expect(generator.calls).toBe(0);
    expect(await repository.list(10)).toEqual([]);
  });

  it("retries with a new code when the generated one already exists", async () => {
    const { repository, generator, shortenUrl } = setup([
      "taken00",
      "taken00",
      "free000",
    ]);
    await occupy(repository, "taken00");

    const shortUrl = await shortenUrl.execute("https://example.com/page");

    expect(shortUrl.code).toBe("free000");
    expect(generator.calls).toBe(3);
    expect((await repository.list(10)).map((entry) => entry.code)).toEqual([
      "free000",
      "taken00",
    ]);
  });

  it("gives up after five attempts and leaves the existing short URL untouched", async () => {
    const { repository, generator, shortenUrl } = setup(["taken00"]);
    await occupy(repository, "taken00");

    await expect(
      shortenUrl.execute("https://example.com/page"),
    ).rejects.toThrow(CodeGenerationFailed);

    expect(generator.calls).toBe(5);
    expect(await repository.list(10)).toMatchObject([
      { code: "taken00", originalUrl: "https://example.com/existing" },
    ]);
  });
});
