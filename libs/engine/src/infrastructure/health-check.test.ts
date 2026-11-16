import { PrismaClient } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { isDatabaseHealthy } from "./health-check";

describe("isDatabaseHealthy", () => {
  it("returns true when the database is reachable", async () => {
    const prisma = new PrismaClient();

    expect(await isDatabaseHealthy(prisma)).toBe(true);

    await prisma.$disconnect();
  });

  it("returns false when the database is unreachable, without hanging or throwing", async () => {
    const unreachable = new PrismaClient({
      datasources: { db: { url: "postgresql://nouser@127.0.0.1:1/nonexistent" } },
    });

    await expect(isDatabaseHealthy(unreachable)).resolves.toBe(false);

    await unreachable.$disconnect();
  });
});
