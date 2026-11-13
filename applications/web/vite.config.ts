import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, resolve(process.cwd(), "../.."), "");

  // Carga desde la raíz del monorepo las variables requeridas por el servidor y Prisma.
  for (const key of ["DATABASE_URL", "PUBLIC_URL"] as const) {
    if (process.env[key] === undefined && env[key] !== undefined) {
      process.env[key] = env[key];
    }
  }

  return {
    envDir: "../..",
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    ssr: {
      // Incluye el paquete compartido en el bundle SSR para resolver sus exportaciones.
      noExternal: ["@url-shortener/engine"],
    },
    optimizeDeps: {
      include: ["@url-shortener/engine"],
    },
  };
});
