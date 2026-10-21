import { PrismaClient } from "@prisma/client";

// Vite's dev server reloads modules on every change. Without caching the client on globalThis,
// each reload would open a new connection pool until Postgres runs out of connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrismaClient(): PrismaClient {
  globalForPrisma.prisma ??= new PrismaClient();
  return globalForPrisma.prisma;
}
