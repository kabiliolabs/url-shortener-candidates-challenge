import { PrismaClient } from "@prisma/client";

// Reutiliza el cliente durante recargas de desarrollo para evitar conexiones duplicadas.
const prismaGlobal = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma = prismaGlobal.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  prismaGlobal.prisma = prisma;
}
