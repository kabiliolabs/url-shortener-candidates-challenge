import { createRequire } from "node:module";
import type { PrismaClient as PrismaClientType } from "@prisma/client";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client") as {
  PrismaClient: new () => PrismaClientType;
};

declare global {
  var __urlShortenerPrisma__: PrismaClientType | undefined;
}

export function getPrismaClient(): PrismaClientType {
  if (globalThis.__urlShortenerPrisma__) {
    return globalThis.__urlShortenerPrisma__;
  }

  const client = new PrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalThis.__urlShortenerPrisma__ = client;
  }

  return client;
}
