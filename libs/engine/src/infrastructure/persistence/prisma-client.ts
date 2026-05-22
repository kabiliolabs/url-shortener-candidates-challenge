import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../generated/prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __urlShortenerPrisma: PrismaClient | undefined;
}

export interface CreatePrismaClientOptions {
  databaseUrl: string;
}

/**
 * Returns a singleton PrismaClient. In development we cache the instance on
 * globalThis to survive Vite HMR module re-evaluation; in production each
 * worker creates its own client at startup.
 *
 * Prisma 7 routes all queries through a driver adapter — we use PrismaPg
 * over node-postgres. The DATABASE_URL no longer comes from schema.prisma;
 * we pass it directly to the adapter here.
 */
export function createPrismaClient(opts: CreatePrismaClientOptions): PrismaClient {
  if (process.env.NODE_ENV !== "production" && globalThis.__urlShortenerPrisma) {
    return globalThis.__urlShortenerPrisma;
  }
  const adapter = new PrismaPg({ connectionString: opts.databaseUrl });
  const client = new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== "production") {
    globalThis.__urlShortenerPrisma = client;
  }
  return client;
}
