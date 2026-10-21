import { execSync } from "node:child_process";

// Integration tests run against a separate Postgres schema, so they can wipe tables
// without touching the data you use while developing.
export function testDatabaseUrl(): string | undefined {
  const base = process.env.DATABASE_URL;
  if (!base) return undefined;
  const url = new URL(base);
  url.searchParams.set("schema", "integration_test");
  return url.toString();
}

/** Vitest global setup: apply migrations to the test schema once before all tests. */
export default function setup() {
  const url = testDatabaseUrl();
  if (!url) return;
  execSync("pnpm exec prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: url },
    stdio: "ignore",
  });
}
