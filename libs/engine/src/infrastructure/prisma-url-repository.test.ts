import Database from "better-sqlite3";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { CodeAlreadyExistsError } from "../domain/errors";
import type { PrismaClient } from "../generated/prisma/client";
import { createPrismaClient } from "./create-prisma-client";
import { PrismaUrlRepository } from "./prisma-url-repository";

const migrationsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../prisma/migrations",
);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("PrismaUrlRepository (real SQLite)", () => {
  let tmpDir: string;
  let prisma: PrismaClient;
  let repository: PrismaUrlRepository;

  beforeAll(() => {
    // A throwaway database file, built from the real migrations.
    tmpDir = mkdtempSync(path.join(tmpdir(), "url-shortener-test-"));
    const dbPath = path.join(tmpDir, "test.db");

    const db = new Database(dbPath);
    const migrations = readdirSync(migrationsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory()) // skips migration_lock.toml
      .map((entry) => entry.name)
      .sort();
    for (const dir of migrations) {
      db.exec(readFileSync(path.join(migrationsDir, dir, "migration.sql"), "utf8"));
    }
    db.close();

    prisma = createPrismaClient(`file:${dbPath}`);
    repository = new PrismaUrlRepository(prisma);
  });

  beforeEach(async () => {
    await prisma.shortUrl.deleteMany();
  });

  afterAll(async () => {
    await prisma?.$disconnect();
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("creates and finds a URL by code", async () => {
    const created = await repository.create({ code: "abc1234", originalUrl: "https://example.com/" });
    expect(created.clicks).toBe(0);

    const found = await repository.findByCode("abc1234");
    expect(found?.originalUrl).toBe("https://example.com/");
    expect(await repository.findByCode("missing")).toBeNull();
  });

  it("rejects a duplicate code with CodeAlreadyExistsError", async () => {
    await repository.create({ code: "dup", originalUrl: "https://one.com/" });
    await expect(
      repository.create({ code: "dup", originalUrl: "https://two.com/" }),
    ).rejects.toThrow(CodeAlreadyExistsError);
  });

  it("increments clicks atomically under concurrency", async () => {
    await repository.create({ code: "hot", originalUrl: "https://example.com/" });
    await Promise.all(Array.from({ length: 20 }, () => repository.registerClick("hot")));
    expect((await repository.findByCode("hot"))?.clicks).toBe(20);
  });

  it("returns null when registering a click for an unknown code", async () => {
    expect(await repository.registerClick("nope")).toBeNull();
  });

  it("lists URLs newest first", async () => {
    await repository.create({ code: "first", originalUrl: "https://one.com/" });
    await sleep(5); // distinct createdAt values
    await repository.create({ code: "second", originalUrl: "https://two.com/" });
    expect((await repository.list()).map((u) => u.code)).toEqual(["second", "first"]);
  });
});