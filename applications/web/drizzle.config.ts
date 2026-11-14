import { defineConfig } from "drizzle-kit";
import { readDatabaseConfig } from "./database/config";

export default defineConfig({
  dialect: "postgresql",
  schema:
    "../../libs/engine/src/modules/url-shortener/infrastructure/persistence/schema.ts",
  out: "./database/migrations",
  dbCredentials: { ...readDatabaseConfig(), ssl: false },
});
