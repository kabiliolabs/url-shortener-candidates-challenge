import { describe, expect, it } from "vitest";
import { DeleteShortUrl } from "../../src/application/use-cases/delete-short-url";
import { InvalidShortCodeError } from "../../src/domain/errors";
import { InMemoryUrlRepository } from "../helpers/in-memory-url-repository";

describe("DeleteShortUrl", () => {
  it("deletes an existing short URL", async () => {
    const repository = new InMemoryUrlRepository();
    repository.seed({
      code: "delete01",
      originalUrl: "https://example.com",
      createdAt: new Date(),
      clicks: 3,
    });

    await expect(new DeleteShortUrl(repository).execute({ code: "delete01" })).resolves.toBe(true);
    expect(repository.find("delete01")).toBeUndefined();
  });

  it("returns false when the short URL does not exist", async () => {
    const repository = new InMemoryUrlRepository();

    await expect(new DeleteShortUrl(repository).execute({ code: "missing1" })).resolves.toBe(false);
  });

  it("rejects malformed short codes", async () => {
    const repository = new InMemoryUrlRepository();

    await expect(new DeleteShortUrl(repository).execute({ code: "bad" })).rejects.toBeInstanceOf(
      InvalidShortCodeError,
    );
  });
});
