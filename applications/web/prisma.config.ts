import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// The monorepo keeps a single .env at the root; in Docker the variables come from compose instead.
config({ path: "../../.env", quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Optional so `prisma generate` works at build time without a database.
  datasource: { url: process.env.DATABASE_URL },
});
