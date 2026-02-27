import { PrismaClient } from "@prisma/client";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve DATABASE_URL to absolute path if it's a relative SQLite path
function resolveDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) {
    console.warn("DATABASE_URL is not set");
    return url;
  }

  // Check if it's a SQLite file URL with a relative path
  if (url.startsWith("file:./") || url.startsWith("file:../")) {
    const filePath = url.replace("file:", "");

    // Resolve relative to the monorepo root (3 levels up from libs/engine/src/db.ts)
    const monorepoRoot = resolve(__dirname, "../../..");
    const absolutePath = join(monorepoRoot, filePath);

    return `file:${absolutePath}`;
  }

  return url;
}

const resolvedUrl = resolveDatabaseUrl(process.env.DATABASE_URL);

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: resolvedUrl,
    },
  },
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});
