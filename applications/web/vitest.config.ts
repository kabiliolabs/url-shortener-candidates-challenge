import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  envDir: "../..",
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "node",
    setupFiles: ["./tests/setup-vitest.ts"],
    include: ["tests/**/*.test.ts"],
  },
});
