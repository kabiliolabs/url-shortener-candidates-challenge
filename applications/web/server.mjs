import compression from "compression";
import express from "express";
import morgan from "morgan";
import { createRequestHandler } from "@react-router/express";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new RangeError(`Invalid PORT value: ${process.env.PORT}`);
}

const build = await import("./build/server/index.js");
const app = express();

app.disable("x-powered-by");
// No se confía en cabeceras reenviadas; la IP se obtiene de la conexión directa.
app.set("trust proxy", false);
app.use(compression());
app.use(
  "/assets",
  express.static("./build/client/assets", {
    immutable: true,
    maxAge: "1y",
  }),
);
app.use(express.static("./build/client", { maxAge: "1h" }));
app.use(express.static("public", { maxAge: "1h" }));
app.use(morgan("tiny"));
app.all(
  "*",
  createRequestHandler({
    build,
    getLoadContext(request) {
      // React Router usa esta IP para aplicar el límite de creación por cliente.
      return { clientIp: request.socket.remoteAddress ?? "unknown" };
    },
    mode: process.env.NODE_ENV,
  }),
);

const host = process.env.HOST ?? "0.0.0.0";
app.listen(port, host, () => {
  console.log(`URL shortener listening on ${host}:${port}`);
});
