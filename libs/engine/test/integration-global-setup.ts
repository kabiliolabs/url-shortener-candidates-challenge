import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import pg from "pg";
import { requireTestDatabaseUrl } from "./test-database-url";

const require = createRequire(import.meta.url);

async function assertDatabaseReachable(databaseUrl: string): Promise<void> {
  const client = new pg.Client({ connectionString: databaseUrl, connectionTimeoutMillis: 3000 });
  try {
    await client.connect();
  } catch (error) {
    throw new Error(
      "Cannot reach the test database. Is Postgres running? Try: docker compose up -d db",
      { cause: error },
    );
  } finally {
    await client.end().catch(() => {});
  }
}

export default async function setup(): Promise<void> {
  const testDatabaseUrl = requireTestDatabaseUrl();
  await assertDatabaseReachable(testDatabaseUrl);

  execFileSync(process.execPath, [require.resolve("prisma/build/index.js"), "migrate", "deploy"], {
    cwd: path.resolve(import.meta.dirname, ".."),
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: "inherit",
  });
}
