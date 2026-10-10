import { createPrismaClient } from "../src/infrastructure/persistence/prisma/create-prisma-client";
import type { PrismaClient } from "../src/infrastructure/persistence/prisma/generated/client";
import { requireTestDatabaseUrl } from "./test-database-url";

export function createTestPrismaClient(): PrismaClient {
  return createPrismaClient(requireTestDatabaseUrl());
}

export async function truncateAllTables(prismaClient: PrismaClient): Promise<void> {
  const [{ current_database: databaseName }] = await prismaClient.$queryRaw<{ current_database: string }[]>`SELECT current_database()`;
  if (!databaseName?.endsWith("_test")) {
    throw new Error(`Refusing to truncate "${databaseName}": test database names must end with "_test".`);
  }
  await prismaClient.$executeRaw`TRUNCATE TABLE "clicks", "short_links" RESTART IDENTITY CASCADE`;
}
