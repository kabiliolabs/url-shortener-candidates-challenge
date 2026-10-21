import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  OriginalUrl,
  ResolveShortUrl,
  ShortCode,
  ShortUrl,
  ShortUrlNotFoundError,
} from "../../src";
import { FixedClock, InMemoryShortUrlRepository } from "../fakes";

describe("SPEC-004: Redirect and count clicks", () => {
  let repository: InMemoryShortUrlRepository;
  let clock: FixedClock;
  let useCase: ResolveShortUrl;

  beforeEach(async () => {
    repository = new InMemoryShortUrlRepository();
    clock = new FixedClock();
    useCase = new ResolveShortUrl({ repository, clock });

    await repository.save(
      ShortUrl.create({
        code: ShortCode.create("abc1234"),
        originalUrl: OriginalUrl.create("https://example.com/page"),
        now: clock.now(),
      }),
    );
  });

  it("returns the original URL", async () => {
    await expect(useCase.execute("abc1234")).resolves.toEqual({
      originalUrl: "https://example.com/page",
    });
  });

  it("counts every click and remembers the last one", async () => {
    await useCase.execute("abc1234");
    clock.advance(60_000);
    await useCase.execute("abc1234");

    const stored = repository.items.get("abc1234")!;
    expect(stored.clicks).toBe(2);
    expect(stored.lastClickedAt).toEqual(clock.current);
  });

  it("fails with not found for unknown codes", async () => {
    await expect(useCase.execute("zzzzzzz")).rejects.toThrow(ShortUrlNotFoundError);
  });

  it("doesn't hit the repository for malformed codes", async () => {
    const spy = vi.spyOn(repository, "registerClick");

    await expect(useCase.execute("../etc")).rejects.toThrow(ShortUrlNotFoundError);
    expect(spy).not.toHaveBeenCalled();
  });
});
