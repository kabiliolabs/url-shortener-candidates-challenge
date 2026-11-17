import { PrismaClient } from "@prisma/client";

// In development Vite re-evaluates this module on every change. Without keeping
// the client on globalThis, each reload would open a new connection pool until
// PostgreSQL runs out of connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
