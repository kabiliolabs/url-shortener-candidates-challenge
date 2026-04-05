import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInMemoryRepository } from "./helpers/in-memory-repository";

const repository = createInMemoryRepository();

vi.mock("@url-shortener/engine/server", () => ({
  shortenedUrlRepository: repository,
  createPrismaRepository: () => repository,
}));

async function reset() {
  vi.resetModules();
  process.env.PUBLIC_URL = "http://test.example";
  repository.records.clear();
}

describe("stats route loader", () => {
  beforeEach(reset);

  it("returns empty state when no links exist", async () => {
    const { loader } = await import("../app/routes/Stats");
    const result = await loader();

    expect(result).toMatchObject({
      totalLinks: 0,
      totalClicks: 0,
      topLinks: [],
      allLinks: [],
    });
  });

  it("totals accumulate correctly", async () => {
    await repository.create({ code: "aa", originalUrl: "https://a.example" });
    await repository.create({ code: "bb", originalUrl: "https://b.example" });
    await repository.incrementClicks("aa");
    await repository.incrementClicks("aa");
    await repository.incrementClicks("bb");

    const { loader } = await import("../app/routes/Stats");
    const result = await loader();

    expect(result.totalLinks).toBe(2);
    expect(result.totalClicks).toBe(3);
  });

  it("allLinks are ordered most-recent first", async () => {
    const now = Date.now();
    repository.records.set("cc", {
      id: "1",
      code: "cc",
      originalUrl: "https://c.example",
      clicks: 0,
      createdAt: new Date(now),
    });
    repository.records.set("dd", {
      id: "2",
      code: "dd",
      originalUrl: "https://d.example",
      clicks: 0,
      createdAt: new Date(now + 1000),
    });

    const { loader } = await import("../app/routes/Stats");
    const { allLinks } = await loader();

    expect(allLinks[0].code).toBe("dd");
    expect(allLinks[1].code).toBe("cc");
  });

  it("topLinks are ordered by clicks descending", async () => {
    await repository.create({ code: "ee", originalUrl: "https://e.example" });
    await repository.create({ code: "ff", originalUrl: "https://f.example" });
    await repository.create({ code: "gg", originalUrl: "https://g.example" });

    await repository.incrementClicks("gg");
    await repository.incrementClicks("gg");
    await repository.incrementClicks("gg");
    await repository.incrementClicks("ee");

    const { loader } = await import("../app/routes/Stats");
    const { topLinks } = await loader();

    expect(topLinks[0].code).toBe("gg");
    expect(topLinks[1].code).toBe("ee");
    expect(topLinks[2].code).toBe("ff");
  });

  it("topLinks caps at 5 entries", async () => {
    for (let i = 0; i < 8; i++) {
      const code = `x${i}`;
      await repository.create({ code, originalUrl: `https://${code}.example` });
      for (let c = 0; c < i; c++) {
        await repository.incrementClicks(code);
      }
    }

    const { loader } = await import("../app/routes/Stats");
    const { topLinks } = await loader();

    expect(topLinks).toHaveLength(5);
  });
});

describe("stats view data – getStatsViewData", () => {
  beforeEach(reset);

  it("is a pure read – does not mutate click counts", async () => {
    await repository.create({ code: "zz", originalUrl: "https://z.example" });
    await repository.incrementClicks("zz");

    const { getStatsViewData } = await import("@url-shortener/engine");
    await getStatsViewData(repository);
    await getStatsViewData(repository);

    const record = await repository.findByCode("zz");
    expect(record?.clicks).toBe(1);
  });
});
