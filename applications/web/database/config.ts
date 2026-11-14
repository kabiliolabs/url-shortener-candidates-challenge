import { loadEnvFile } from "node:process";
import { resolve } from "node:path";
import type { DatabaseConfig } from "@url-shortener/database";

export function readDatabaseConfig(): DatabaseConfig {
  try {
    loadEnvFile(resolve("../../.env"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  return {
    host: process.env.POSTGRES_HOST ?? "",
    port: Number(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB ?? "",
    user: process.env.POSTGRES_USER ?? "",
    password: process.env.POSTGRES_PASSWORD ?? "",
    connectionTimeoutMillis: 5000,
  };
}
