import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

// Load .env from cwd (e.g. applications/web when running dev) so DATABASE_URL is set
config();

const ENV = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  DATABASE_URL: process.env.DATABASE_URL ?? "",
} as const;

const LOG_LEVELS = {
  DEVELOPMENT: ["error", "warn"],
  PRODUCTION: ["error"],
} as const;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: ENV.DATABASE_URL });
  const log = ENV.NODE_ENV === "development" ? [...LOG_LEVELS.DEVELOPMENT] : [...LOG_LEVELS.PRODUCTION];
  return new PrismaClient({ adapter, log });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (ENV.NODE_ENV !== "production") globalForPrisma.prisma = db;
