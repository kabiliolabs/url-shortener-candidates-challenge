import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  envDir: "../..",
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  ssr: {
    // Bundle our workspace engine source — it's TypeScript with no build step.
    noExternal: ["@url-shortener/engine"],
    // Keep native/Node-only deps out of the SSR bundle so Node resolves them
    // at runtime. Prisma's `.prisma/client/default` indirection can't survive
    // bundling (Node ESM rejects package names starting with `.`); ioredis
    // depends on Node's net/tls.
    external: ["@prisma/client", ".prisma/client", "ioredis", "nanoid"],
  },
});
