import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env from monorepo root if DATABASE_URL is not already set
// This gives precedence to environment variables (e.g., from docker-compose.yml)
// while still supporting local development via .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, "../../.env");

if (!process.env.DATABASE_URL) {
  config({ path: rootEnvPath });
}

const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
