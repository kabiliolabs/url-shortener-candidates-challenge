import type { Logger } from "@url-shortener/engine";
import { pino } from "pino";

const pinoInstance = pino({
  level:
    process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
  base: { service: "url-shortener-web" },
});

export const logger: Logger = pinoInstance;
