import path from "node:path";
import { config } from "dotenv";

export function requireTestDatabaseUrl(): string {
  config({ path: path.resolve(import.meta.dirname, "../../../.env"), quiet: true });

  const testDatabaseUrl = process.env.TEST_DATABASE_URL;
  if (!testDatabaseUrl) {
    throw new Error(
      "TEST_DATABASE_URL is not set. Integration tests wipe their database, so they never fall back to DATABASE_URL. Define it in the root .env (see .env.example).",
    );
  }
  if (testDatabaseUrl === process.env.DATABASE_URL) {
    throw new Error("TEST_DATABASE_URL must differ from DATABASE_URL: integration tests truncate every table.");
  }
  return testDatabaseUrl;
}
