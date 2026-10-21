import { beforeEach, describe, expect, it } from "vitest";
import { ListShortUrls, OriginalUrl, ShortCode, ShortUrl } from "../../src";
import { FixedClock, InMemoryShortUrlRepository } from "../fakes";

describe("SPEC-005: Stats page", () => {
  let repository: InMemoryShortUrlRepository;
  let useCase: ListShortUrls;

  // Creates `count` short URLs, one minute apart, so ordering is predictable.
  async function seed(count: number) {
    const clock = new FixedClock();
    for (let i = 0; i < count; i++) {
      await repository.save(
        ShortUrl.create({
          code: ShortCode.create(`code${String(i).padStart(3, "0")}`),
          originalUrl: OriginalUrl.create(`https://example.com/${i}`),
          now: clock.now(),
        }),
      );
      clock.advance(60_000);
    }
  }

  beforeEach(() => {
    repository = new InMemoryShortUrlRepository();
    useCase = new ListShortUrls({ repository });
  });

  it("lists newest first, 20 per page", async () => {
    await seed(25);

    const first = await useCase.execute({ page: 1 });
    const second = await useCase.execute({ page: 2 });

    expect(first.items).toHaveLength(20);
    expect(first.items[0].code).toBe("code024");
    expect(second.items).toHaveLength(5);
    expect(first).toMatchObject({ page: 1, total: 25, totalPages: 2 });
  });

  it.each([0, -1, 1.5, Number.NaN])("falls back to page 1 for %s", async (page) => {
    await seed(1);
    await expect(useCase.execute({ page })).resolves.toMatchObject({ page: 1 });
  });

  it("returns an empty page when there's nothing yet", async () => {
    await expect(useCase.execute({ page: 1 })).resolves.toMatchObject({
      items: [],
      total: 0,
      totalPages: 1,
    });
  });
});
