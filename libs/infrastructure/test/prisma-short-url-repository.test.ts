import { PrismaClient } from "@prisma/client";
import {
  OriginalUrl,
  ShortCode,
  ShortCodeAlreadyExistsError,
  ShortUrl,
} from "@url-shortener/engine";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaShortUrlRepository } from "../src";
import { testDatabaseUrl } from "./setup/test-database";

const url = testDatabaseUrl();

function shortUrl(code: string, createdAt = new Date("2026-01-01T10:00:00Z")) {
  return ShortUrl.create({
    code: ShortCode.create(code),
    originalUrl: OriginalUrl.create(`https://example.com/${code}`),
    now: createdAt,
  });
}

// Needs Postgres running (`docker compose up -d db`). Skipped if DATABASE_URL isn't set.
describe.skipIf(!url)("SPEC-006: Persistence (PrismaShortUrlRepository)", () => {
  const prisma = new PrismaClient({ datasourceUrl: url });
  const repository = new PrismaShortUrlRepository(prisma);

  beforeEach(async () => {
    await prisma.shortUrl.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("saves a short URL and reads it back", async () => {
    await repository.save(shortUrl("abc1234"));

    const { items, total } = await repository.list({ offset: 0, limit: 10 });

    expect(total).toBe(1);
    expect(items[0].code.value).toBe("abc1234");
    expect(items[0].originalUrl.value).toBe("https://example.com/abc1234");
    expect(items[0].clicks).toBe(0);
  });

  it("throws the domain error when the code already exists (SPEC-003)", async () => {
    await repository.save(shortUrl("abc1234"));

    await expect(repository.save(shortUrl("abc1234"))).rejects.toThrow(
      ShortCodeAlreadyExistsError,
    );
  });

  it("registers clicks and returns null for unknown codes (SPEC-004)", async () => {
    await repository.save(shortUrl("abc1234"));
    const at = new Date("2026-01-02T12:00:00Z");

    const updated = await repository.registerClick(ShortCode.create("abc1234"), at);

    expect(updated?.clicks).toBe(1);
    expect(updated?.lastClickedAt).toEqual(at);
    await expect(repository.registerClick(ShortCode.create("zzzzzzz"), at)).resolves.toBeNull();
  });

  it("doesn't lose clicks under concurrency (ADR-004)", async () => {
    await repository.save(shortUrl("abc1234"));
    const code = ShortCode.create("abc1234");

    await Promise.all(Array.from({ length: 50 }, () => repository.registerClick(code, new Date())));

    const row = await prisma.shortUrl.findUnique({ where: { code: "abc1234" } });
    expect(row?.clicks).toBe(50);
  });

  it("lists newest first with offset and limit (SPEC-005)", async () => {
    await repository.save(shortUrl("old0001", new Date("2026-01-01")));
    await repository.save(shortUrl("mid0001", new Date("2026-01-02")));
    await repository.save(shortUrl("new0001", new Date("2026-01-03")));

    const { items, total } = await repository.list({ offset: 1, limit: 1 });

    expect(total).toBe(3);
    expect(items.map((item) => item.code.value)).toEqual(["mid0001"]);
  });
});
