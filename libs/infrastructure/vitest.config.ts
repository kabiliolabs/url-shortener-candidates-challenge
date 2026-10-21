import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: ["./test/setup/test-database.ts"],
    // Integration tests share one database, so don't run files in parallel.
    fileParallelism: false,
  },
});
