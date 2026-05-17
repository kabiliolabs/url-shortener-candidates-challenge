import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function createPrismaClient() {
  const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

declare global {
  var __prisma: PrismaClient | undefined;
}

// Reuse in dev to avoid exhausting connections on hot reload
export const prisma = global.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
