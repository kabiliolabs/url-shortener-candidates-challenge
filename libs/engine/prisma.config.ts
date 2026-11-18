import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

const packageDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(packageDir, "../..");

loadEnv({ path: resolve(repoRoot, ".env") });

const databaseUrl = process.env.DATABASE_URL ?? "file:./data/dev.db";
const databaseFile = databaseUrl.replace(/^file:/, "");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseFile.startsWith("/")
      ? `file:${databaseFile}`
      : `file:${resolve(repoRoot, databaseFile)}`,
  },
});
