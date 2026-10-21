import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  envDir: "../..",
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  ssr: {
    // Workspace libs ship TypeScript source, so Vite has to bundle them.
    noExternal: ["@url-shortener/engine", "@url-shortener/infrastructure"],
    // Prisma loads its generated client from node_modules at runtime, so it can't be bundled.
    external: ["@prisma/client"],
  },
  optimizeDeps: {
    include: ["@url-shortener/engine"],
  },
});
