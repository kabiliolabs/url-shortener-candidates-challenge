import { config } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function loadEnv(): void {
  config({
    path: resolve(fileURLToPath(new URL("../../../.env", import.meta.url))),
  });
}
