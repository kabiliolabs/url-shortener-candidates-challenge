import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  envDir: "../..",
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  ssr: {
    noExternal: ["@url-shortener/engine"],
    // @prisma/client relies on runtime-only module resolution (`.prisma/client/...`)
    // that breaks if Vite tries to statically bundle it; must stay external even
    // though the workspace package that imports it (@url-shortener/engine) is inlined.
    external: ["@prisma/client"],
  },
  optimizeDeps: {
    include: ["@url-shortener/engine"],
  },
});
