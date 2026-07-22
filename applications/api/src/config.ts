import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ApiConfiguration } from "./types/configuration.js";

export function loadConfiguration(): ApiConfiguration {
  dotenv.config({
    path: resolve(dirname(fileURLToPath(import.meta.url)), "../../../.env"),
  });

  const mongoUrl = process.env.MONGODB_URI;
  const publicUrl = process.env.PUBLIC_URL;

  if (!mongoUrl || !publicUrl) {
    throw new Error("MONGODB_URI and PUBLIC_URL must be configured");
  }

  const port = Number(process.env.PORT ?? 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT must be a valid TCP port");
  }

  return {
    port,
    mongoUrl,
    publicUrl: publicUrl.replace(/\/$/, ""),
  };
}
