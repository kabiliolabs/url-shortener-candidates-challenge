import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    // Integration tests boot Postgres/Redis testcontainers — give them room.
    testTimeout: 120_000,
    hookTimeout: 180_000,
  },
});
