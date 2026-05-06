import { config } from "dotenv"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../generated/client/client.js"

config()

const ENV = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  DATABASE_URL: process.env.DATABASE_URL ?? "",
} as const

function buildClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: ENV.DATABASE_URL })
  const log =
    ENV.NODE_ENV === "development"
      ? (["error", "warn"] as const)
      : (["error"] as const)
  return new PrismaClient({ adapter, log })
}

const globalRef = globalThis as unknown as { __db?: PrismaClient }
export const db = globalRef.__db ?? buildClient()
if (ENV.NODE_ENV !== "production") globalRef.__db = db
