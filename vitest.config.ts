import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      "applications/web/vitest.config.ts",
      "infra/database/vitest.config.ts",
    ],
    reporters: ["default"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["applications/*/app/**", "infra/*/src/**"],
      exclude: ["**/*.test.*", "**/test-utils/**", "**/.react-router/**"],
    },
  },
});
