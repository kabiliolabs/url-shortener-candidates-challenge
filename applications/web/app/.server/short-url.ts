import { PrismaClient } from "@prisma/client";
import {
  createShortUrlUseCase,
  resolveShortUrlUseCase,
  createCodeGenerator,
} from "@url-shortener/engine";
import { createPrismaShortUrlRepository } from "./prisma-short-url-repository";

// Composition root for the short-URL feature: the only module that knows
// about Prisma. Routes depend on the use-cases below, never on Prisma
// directly (DIP).

// Reuse a single PrismaClient across hot reloads. Without this, Vite/RR dev
// re-evaluates the module on every change and opens a new connection pool each
// time, eventually exhausting the database's connection limit.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

const repository = createPrismaShortUrlRepository(prisma);
const codeGenerator = createCodeGenerator();

export const createShortUrl = createShortUrlUseCase({
  repository,
  codeGenerator,
});

export const resolveShortUrl = resolveShortUrlUseCase({ repository });
