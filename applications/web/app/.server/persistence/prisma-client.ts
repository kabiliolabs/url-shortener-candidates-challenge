import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../generated/prisma/client";
import { config } from "../config";

// Dev HMR re-evaluates modules; caching on globalThis keeps a single connection pool across reloads.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = (globalForPrisma.prisma ??= new PrismaClient({
  adapter: new PrismaPg({ connectionString: config.databaseUrl }),
}));
