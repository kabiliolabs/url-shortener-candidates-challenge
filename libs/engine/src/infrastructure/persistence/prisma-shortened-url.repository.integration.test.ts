import { execSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { RedisContainer, type StartedRedisContainer } from "@testcontainers/redis";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createEngine, type Engine } from "../../engine";

// Resolve the engine package root (libs/engine) so we can run prisma migrate
// deploy against the fresh Postgres container before booting the engine.
// @ts-ignore
const __dirname = dirname(fileURLToPath(import.meta.url));
const ENGINE_ROOT = resolve(__dirname, "../../..");

describe("integration: engine wired to real Postgres + Redis", () => {
  let pg: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let engine: Engine;
  let databaseUrl: string;

  beforeAll(async () => {
    pg = await new PostgreSqlContainer("postgres:16-alpine")
      .withDatabase("shortener")
      .withUsername("app")
      .withPassword("app")
      .start();
    redis = await new RedisContainer("redis:7-alpine").start();

    databaseUrl = pg.getConnectionUri();
    const redisUrl = `redis://${redis.getHost()}:${redis.getMappedPort(6379)}`;

    execSync("pnpm exec prisma migrate deploy", {
      cwd: ENGINE_ROOT,
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: "inherit",
    });

    engine = createEngine({
      databaseUrl,
      redisUrl,
      baseUrl: "http://localhost:3000",
      // Disable rate limiting for the test so we can fire several shortens
      // in a row without bumping into the default 10/min window.
      rateLimit: { maxRequests: 10_000, windowSeconds: 60 },
    });
  }, 120_000);

  afterAll(async () => {
    await engine?.dispose();
    await pg?.stop();
    await redis?.stop();
  });

  it("reports both Postgres and Redis healthy", async () => {
    const result = await engine.healthCheck();
    expect(result).toEqual({ db: true, redis: true });
  });

  it("shortens a URL, persists it to Postgres, and resolves it back", async () => {
    const shortened = await engine.shortenUrl({
      url: "https://example.com/integration",
      clientIp: "1.2.3.4",
    });
    expect(shortened.code.value).toMatch(/^[A-Za-z0-9]{7}$/);

    const resolved = await engine.resolveShortCode(shortened.code.value);
    expect(resolved).toBe("https://example.com/integration");
  });

  it("treats unknown codes as not-found", async () => {
    await expect(engine.resolveShortCode("zzzzzzz")).rejects.toMatchObject({
      name: "CodeNotFoundError",
    });
  });

  it("listRecentUrls returns the most recently shortened codes via Redis", async () => {
    const first = await engine.shortenUrl({
      url: "https://example.com/recent-a",
      clientIp: "9.9.9.9",
    });
    const second = await engine.shortenUrl({
      url: "https://example.com/recent-b",
      clientIp: "9.9.9.9",
    });
    const items = await engine.listRecentUrls({ limit: 5 });
    expect(items[0]?.code.value).toBe(second.code.value);
    expect(items[1]?.code.value).toBe(first.code.value);
  });

  it("plans a point lookup on `code` as a partitioned-table scan that prunes to one partition", async () => {
    // Use the same Prisma instance the engine holds via $queryRaw indirectly:
    // we can't reach it from outside, so build a throwaway client for EXPLAIN.
    const { PrismaClient } = await import("../../generated/prisma/client");
    const { PrismaPg } = await import("@prisma/adapter-pg");
    const adapter = new PrismaPg({ connectionString: databaseUrl });
    const probe = new PrismaClient({ adapter });
    try {
      const sample = await engine.shortenUrl({
        url: "https://example.com/explain",
        clientIp: "2.2.2.2",
      });
      const rows = (await probe.$queryRawUnsafe(
        `EXPLAIN SELECT * FROM "shortened_url" WHERE "code" = $1`,
        sample.code.value,
      )) as Array<Record<string, string>>;
      const plan = rows.map((r) => Object.values(r)[0]).join("\n");
      // Postgres labels partitioned scans with `Append` over child indexes;
      // pruning shows up as a single child being scanned.
      expect(plan).toMatch(/shortened_url_p\d{2}/);
    } finally {
      await probe.$disconnect();
    }
  });
});
