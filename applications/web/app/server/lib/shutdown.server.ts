import { disconnectAll } from "@url-shortener/database";

let isShuttingDown = false;

export function registerShutdownHooks(): void {
  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`Received ${signal}, shutting down gracefully...`);
    await disconnectAll();
    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}
