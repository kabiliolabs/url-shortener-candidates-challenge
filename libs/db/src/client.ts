import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Prisma Client Singleton
 * 
 * Prevents multiple instances in development due to hot reloading.
 * In production, creates a single instance per process.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Graceful shutdown helper
 * Call this when your application is shutting down
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

// Re-export Prisma namespace for type utilities
export { Prisma };
