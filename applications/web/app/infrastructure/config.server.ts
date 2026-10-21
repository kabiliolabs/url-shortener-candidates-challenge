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

  // Defaults to the Postgres instance published by `docker compose up -d db`,
  // so local development needs no .env file. Required in production.
  databaseUrl: requiredInProduction(
    "DATABASE_URL",
    process.env.DATABASE_URL,
    "postgresql://urlshortener:urlshortener@localhost:5433/urlshortener?schema=public",
  ),
} as const;
