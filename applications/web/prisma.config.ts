import path from "node:path"
import { defineConfig } from "prisma/config"
import { PrismaPg } from "@prisma/adapter-pg"

const DATABASE_URL = process.env.DATABASE_URL ?? ""

export default defineConfig({
  schema: path.join(import.meta.dirname, "prisma/schema.prisma"),
  migrate: {
    adapter: new PrismaPg({ connectionString: DATABASE_URL }),
  },
})
