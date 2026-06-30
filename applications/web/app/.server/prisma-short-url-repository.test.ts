import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import {
  DuplicateCodeError,
  type ShortUrlRepository,
} from "@url-shortener/engine";
import { createPrismaShortUrlRepository } from "./prisma-short-url-repository";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const hasDatabase = Boolean(testDatabaseUrl);

describe.skipIf(!hasDatabase)("PrismaShortUrlRepository (integration)", () => {
  let prisma: PrismaClient;
  let repository: ShortUrlRepository;

  beforeAll(() => {
    assertSafeTestDatabaseUrl(testDatabaseUrl);

    prisma = new PrismaClient({
      datasources: {
        db: {
          url: testDatabaseUrl,
        },
      },
    });
    repository = createPrismaShortUrlRepository(prisma);
  });

  beforeEach(async () => {
    await prisma.shortUrl.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("throws DuplicateCodeError when the code already exists", async () => {
    await repository.save({
      code: "dupCode",
      originalUrl: "https://example.com/",
    });

    await expect(
      repository.save({
        code: "dupCode",
        originalUrl: "https://example.org/",
      }),
    ).rejects.toBeInstanceOf(DuplicateCodeError);
  });

  it("increments clicks atomically by exactly 1", async () => {
    const saved = await repository.save({
      code: "clkCode",
      originalUrl: "https://example.com/",
    });

    await repository.incrementClicks("clkCode");

    const found = await repository.findByCode("clkCode");
    expect(found?.clicks).toBe(saved.clicks + 1);
  });
});

function assertSafeTestDatabaseUrl(
  rawUrl: string | undefined,
): asserts rawUrl is string {
  if (!rawUrl) {
    throw new Error("TEST_DATABASE_URL is required for integration tests.");
  }

  const databaseName = new URL(rawUrl).pathname.replace(/^\//, "");
  if (!databaseName.toLowerCase().includes("test")) {
    throw new Error(
      `Refusing to run destructive integration tests against non-test database "${databaseName}".`,
    );
  }
}
