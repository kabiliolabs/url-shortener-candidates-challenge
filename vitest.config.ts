import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./applications/web/app", import.meta.url)),
    },
  },
  test: {
    // component tests opt into jsdom with a `@vitest-environment jsdom` docblock
    environment: "node",
    include: ["libs/**/*.test.ts", "applications/**/*.test.{ts,tsx}"],
    passWithNoTests: true,
  },
});
