import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { Click, DestinationUrl, ShortCode, ShortLink } from "../../../domain";
import type { PrismaClient } from "./generated/client";
import { createTestPrismaClient, truncateAllTables } from "../../../../test/integration-test-database";
import { PrismaClickRepository } from "./prisma-click.repository";
import { PrismaShortLinkRepository } from "./prisma-short-link.repository";
import { PrismaShortLinkStatsQuery } from "./prisma-short-link-stats.query";

const prismaClient: PrismaClient = createTestPrismaClient();
const shortLinks = new PrismaShortLinkRepository(prismaClient);
const clicks = new PrismaClickRepository(prismaClient);
const stats = new PrismaShortLinkStatsQuery(prismaClient);

async function givenLink(code: string, createdAt: string, clickCount = 0): Promise<void> {
  const shortCode = new ShortCode(code);
  await shortLinks.save(
    ShortLink.create({
      code: shortCode,
      destination: new DestinationUrl(`https://example.com/${code}`),
      createdAt: new Date(createdAt),
    }),
  );
  for (let i = 0; i < clickCount; i++) {
    await clicks.record(Click.record({ shortCode, occurredAt: new Date() }));
  }
}

beforeEach(() => truncateAllTables(prismaClient));
afterAll(() => prismaClient.$disconnect());

describe("PrismaShortLinkStatsQuery", () => {
  it("returns nothing when there are no links", async () => {
    expect(await stats.listWithClickCounts(10)).toEqual([]);
  });

  it("reports each link with its own click count, including zero, as a number", async () => {
    await givenLink("aaaaaa1", "2026-01-01T00:00:00.000Z", 3);
    await givenLink("bbbbbb2", "2026-01-02T00:00:00.000Z", 0);

    const result = await stats.listWithClickCounts(10);

    expect(result).toEqual([
      {
        code: "bbbbbb2",
        destination: "https://example.com/bbbbbb2",
        createdAt: new Date("2026-01-02T00:00:00.000Z"),
        clickCount: 0,
      },
      {
        code: "aaaaaa1",
        destination: "https://example.com/aaaaaa1",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        clickCount: 3,
      },
    ]);
  });

  it("orders links newest first", async () => {
    await givenLink("oldest1", "2026-01-01T00:00:00.000Z");
    await givenLink("newest1", "2026-01-03T00:00:00.000Z");
    await givenLink("middle1", "2026-01-02T00:00:00.000Z");

    const codes = (await stats.listWithClickCounts(10)).map((entry) => entry.code);

    expect(codes).toEqual(["newest1", "middle1", "oldest1"]);
  });

  it("breaks ties on equal creation time deterministically by code", async () => {
    await givenLink("ccccccc", "2026-01-01T00:00:00.000Z");
    await givenLink("aaaaaaa", "2026-01-01T00:00:00.000Z");
    await givenLink("bbbbbbb", "2026-01-01T00:00:00.000Z");

    const codes = (await stats.listWithClickCounts(10)).map((entry) => entry.code);

    expect(codes).toEqual(["aaaaaaa", "bbbbbbb", "ccccccc"]);
  });

  it("returns at most the requested number of links, keeping the newest", async () => {
    await givenLink("link001", "2026-01-01T00:00:00.000Z");
    await givenLink("link002", "2026-01-02T00:00:00.000Z");
    await givenLink("link003", "2026-01-03T00:00:00.000Z");

    const codes = (await stats.listWithClickCounts(2)).map((entry) => entry.code);

    expect(codes).toEqual(["link003", "link002"]);
  });
});
