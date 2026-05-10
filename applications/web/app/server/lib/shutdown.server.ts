import { disconnectAll } from "@url-shortener/database";
import { logger } from "./logger.server";

let isShuttingDown = false;

export function registerShutdownHooks(): void {
  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info({ signal }, "Shutting down gracefully...");
    try {
      await disconnectAll();
    } catch (err) {
      logger.error({ err }, "Error during disconnect");
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}
