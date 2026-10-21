import { PrismaClient } from "@prisma/client";
import { config } from "../config.server";

/**
 * Single Prisma client for the process. The `globalThis` cache prevents Vite's
 * HMR from opening a new connection pool on every reload in development.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Passed explicitly rather than relying on dotenv discovery, so the app and
    // the Prisma CLI cannot drift apart.
    datasourceUrl: config.databaseUrl,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
