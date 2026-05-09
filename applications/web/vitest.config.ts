import { defineProject } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineProject({
  plugins: [react(), tsconfigPaths()],
  test: {
    name: "web",
    environment: "happy-dom",
    include: ["app/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".react-router"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
