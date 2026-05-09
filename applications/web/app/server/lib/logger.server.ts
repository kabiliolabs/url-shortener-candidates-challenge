import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  ...(process.env.NODE_ENV === "development" && {
    transport: { target: "pino-pretty", options: { colorize: true } },
  }),
  base: { service: "url-shortener", env: process.env.NODE_ENV },
  redact: ["req.headers.authorization", "req.headers.cookie"],
});
