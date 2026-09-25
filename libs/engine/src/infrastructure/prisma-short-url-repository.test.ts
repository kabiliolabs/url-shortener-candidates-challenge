import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ShortCodeCollisionError } from "../domain/errors";
import { PrismaShortUrlRepository } from "./prisma-short-url-repository";

const engineDir = path.resolve(__dirname, "../..");
const prismaBin = path.join(engineDir, "node_modules/.bin/prisma");
const testDbFile = path.join(engineDir, "prisma/test-prisma-short-url-repository.db");
const testDbUrl = `file:${testDbFile}`;

let prisma: PrismaClient;
let repository: PrismaShortUrlRepository;

beforeAll(() => {
  execFileSync(prismaBin, ["db", "push", "--skip-generate"], {
    cwd: engineDir,
    env: { ...process.env, DATABASE_URL: testDbUrl },
    stdio: "pipe",
  });
  prisma = new PrismaClient({ datasources: { db: { url: testDbUrl } } });
  repository = new PrismaShortUrlRepository(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
  for (const file of [testDbFile, `${testDbFile}-journal`]) {
    if (existsSync(file)) rmSync(file);
  }
});

describe("PrismaShortUrlRepository", () => {
  it("creates and finds a short url by code", async () => {
    const created = await repository.create({
      code: "abc1234",
      originalUrl: "https://example.com/",
    });
    expect(created.code).toBe("abc1234");
    expect(created.clickCount).toBe(0);
    expect(created.lastClickedAt).toBeNull();

    const found = await repository.findByCode("abc1234");
    expect(found?.originalUrl).toBe("https://example.com/");
  });

  it("rejects a duplicate code with ShortCodeCollisionError (DB unique constraint)", async () => {
    await repository.create({ code: "dup0001", originalUrl: "https://one.example.com" });

    await expect(
      repository.create({ code: "dup0001", originalUrl: "https://two.example.com" }),
    ).rejects.toThrow(ShortCodeCollisionError);
  });

  it("incrementClick updates clickCount and lastClickedAt", async () => {
    await repository.create({ code: "clk0001", originalUrl: "https://click.example.com" });

    const updated = await repository.incrementClick("clk0001");

    expect(updated.clickCount).toBe(1);
    expect(updated.lastClickedAt).not.toBeNull();
  });

  it("list returns all created entries", async () => {
    const urls = await repository.list();

    expect(urls.length).toBeGreaterThanOrEqual(3);
  });
});
