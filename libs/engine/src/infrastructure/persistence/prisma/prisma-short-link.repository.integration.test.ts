import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { DestinationUrl, ShortCode, ShortCodeAlreadyExistsError, ShortLink } from "../../../domain";
import type { PrismaClient } from "./generated/client";
import { createTestPrismaClient, truncateAllTables } from "../../../../test/integration-test-database";
import { PrismaShortLinkRepository } from "./prisma-short-link.repository";

const prismaClient: PrismaClient = createTestPrismaClient();
const repository = new PrismaShortLinkRepository(prismaClient);

function aLink(code: string, destination = "https://example.com/a", createdAt = new Date("2026-01-02T03:04:05.678Z")) {
  return ShortLink.create({ code: new ShortCode(code), destination: new DestinationUrl(destination), createdAt });
}

beforeEach(() => truncateAllTables(prismaClient));
afterAll(() => prismaClient.$disconnect());

describe("PrismaShortLinkRepository", () => {
  it("finds a saved link with the same code, destination and creation date", async () => {
    const link = aLink("abc1234");
    await repository.save(link);

    const found = await repository.findByCode(new ShortCode("abc1234"));

    if (!found) throw new Error("expected the saved link to be found");
    expect(found.code.equals(link.code)).toBe(true);
    expect(found.destination.equals(link.destination)).toBe(true);
    expect(found.createdAt).toEqual(link.createdAt);
  });

  it("returns null when the code is unknown", async () => {
    expect(await repository.findByCode(new ShortCode("nope123"))).toBeNull();
  });

  it("rejects a duplicate code with ShortCodeAlreadyExistsError carrying that code", async () => {
    await repository.save(aLink("dup1234"));

    const error = await repository.save(aLink("dup1234", "https://example.com/other")).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ShortCodeAlreadyExistsError);
    expect((error as ShortCodeAlreadyExistsError).code.equals(new ShortCode("dup1234"))).toBe(true);
  });

  it("keeps the original link when a duplicate save is rejected", async () => {
    await repository.save(aLink("dup1234", "https://example.com/original"));

    await repository.save(aLink("dup1234", "https://example.com/other")).catch(() => undefined);

    const found = await repository.findByCode(new ShortCode("dup1234"));
    if (!found) throw new Error("expected the original link to be found");
    expect(found.destination.value).toBe("https://example.com/original");
  });

  it("lets exactly one of two concurrent saves of the same code succeed", async () => {
    const results = await Promise.allSettled([
      repository.save(aLink("race123", "https://example.com/first")),
      repository.save(aLink("race123", "https://example.com/second")),
    ]);

    const fulfilled = results.filter((result) => result.status === "fulfilled");
    const rejected = results.filter((result): result is PromiseRejectedResult => result.status === "rejected");
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0]?.reason).toBeInstanceOf(ShortCodeAlreadyExistsError);
    expect(await prismaClient.shortLink.count({ where: { code: "race123" } })).toBe(1);
  });
});
