import path from "node:path";

/**
 * Validated configuration, read once at startup.
 *
 * The original code did `export const baseUrl = process.env.PUBLIC_URL` with no
 * validation, so a missing variable silently produced links like
 * "undefined/s/ab". Here every value has a working local default, so `pnpm dev`
 * needs no setup, while Docker injects the real ones.
 */
function requiredInProduction(name: string, value: string | undefined, fallback: string): string {
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return fallback;
  }
  return value;
}

export const config = {
  publicUrl: requiredInProduction(
    "PUBLIC_URL",
    process.env.PUBLIC_URL,
    "http://localhost:5173",
  ).replace(/\/+$/, ""),

  // An absolute path removes any ambiguity about what a relative SQLite path is
  // relative to (CWD vs. schema directory).
  databaseUrl:
    process.env.DATABASE_URL ??
    `file:${path.join(process.cwd(), "prisma", "data", "dev.db")}`,
} as const;
