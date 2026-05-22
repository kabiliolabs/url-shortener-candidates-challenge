import { defineConfig } from "prisma/config";

// Prisma 7 reads CLI-time datasource configuration from this file (migrate
// deploy, db push, etc.). Runtime PrismaClient instantiation still receives
// its URL via the PrismaPg adapter in src/infrastructure/persistence/prisma-client.ts.
//
// `prisma generate` doesn't actually need a real DATABASE_URL — only migrate
// and push operations do — so we fall back to a placeholder when the env
// var isn't set. Real operations always pass a working URL via Docker
// compose, CI secrets, or the developer's shell.
const PLACEHOLDER_URL = "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? PLACEHOLDER_URL,
  },
});
