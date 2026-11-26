import { describe, expect, it } from "vitest";
import { shortenUrl } from "./shorten-url";
import { InMemoryShortLinkRepository } from "../testing/in-memory-short-link-repository";

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

  it("retries when the generated code is already taken", async () => {
    const repository = new InMemoryShortLinkRepository();
    await repository.create({
      url: "https://other.example/taken",
      code: "takenok",
    });
    const codes = ["takenok", "freecode"];
    let index = 0;

    const result = await shortenUrl(
      repository,
      "https://example.com/new",
      () => codes[index++] ?? "unused",
    );

    expect(result).toEqual({
      ok: true,
      code: "freecode",
      url: "https://example.com/new",
    });
    expect(index).toBe(2);
  });

  it("returns an error after 5 code collisions", async () => {
    const repository = new InMemoryShortLinkRepository();
    const taken = ["code001", "code002", "code003", "code004", "code005"];
    for (const code of taken) {
      await repository.create({ url: `https://other.example/${code}`, code });
    }
    let index = 0;

    const result = await shortenUrl(repository, "https://example.com/new", () => {
      const code = taken[index] ?? "freecode";
      index += 1;
      return code;
    });

    expect(result).toEqual({
      ok: false,
      message: "Could not assign a unique short code. Try again.",
    });
    expect(index).toBe(5);
  });
});
