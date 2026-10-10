import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { Click, DomainError, DestinationUrl, ShortCode, ShortLink } from "../../../domain";
import type { PrismaClient } from "./generated/client";
import { createTestPrismaClient, truncateAllTables } from "../../../../test/integration-test-database";
import { PrismaClickRepository } from "./prisma-click.repository";
import { PrismaShortLinkRepository } from "./prisma-short-link.repository";
import { PrismaShortLinkStatsQuery } from "./prisma-short-link-stats.query";

const prismaClient: PrismaClient = createTestPrismaClient();
const shortLinks = new PrismaShortLinkRepository(prismaClient);
const clicks = new PrismaClickRepository(prismaClient);
const stats = new PrismaShortLinkStatsQuery(prismaClient);

beforeEach(() => truncateAllTables(prismaClient));
afterAll(() => prismaClient.$disconnect());

describe("PrismaClickRepository", () => {
  it("records every click against its link so the stats query counts them", async () => {
    const code = new ShortCode("click01");
    await shortLinks.save(
      ShortLink.create({ code, destination: new DestinationUrl("https://example.com"), createdAt: new Date() }),
    );

    await clicks.record(Click.record({ shortCode: code, occurredAt: new Date("2026-01-01T00:00:00.000Z") }));
    await clicks.record(Click.record({ shortCode: code, occurredAt: new Date("2026-01-01T00:00:00.000Z") }));

    const [entry] = await stats.listWithClickCounts(10);
    expect(entry?.clickCount).toBe(2);
  });

  it("rejects a click for an unknown code with a non-domain error", async () => {
    const click = Click.record({ shortCode: new ShortCode("ghost01"), occurredAt: new Date() });

    const error = await clicks.record(click).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(DomainError);
  });
});
