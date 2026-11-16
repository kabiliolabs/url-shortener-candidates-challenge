import type { PrismaClient } from "@prisma/client";

export async function isDatabaseHealthy(prisma: PrismaClient): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
