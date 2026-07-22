import express, { type Express } from "express";
import swaggerUi from "swagger-ui-express";
import { HealthController } from "../controllers/health-controller.js";
import { UrlController } from "../controllers/url-controller.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { openApiDocument } from "./openapi.js";
import { setSecurityHeaders } from "./middlewares/security-headers.js";
import { createUrlRouter } from "./routes/url-routes.js";

export function createApp(
  healthController: HealthController,
  urlController: UrlController,
): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(setSecurityHeaders);
  app.use(express.json({ limit: "10kb" }));
  app.get("/health", healthController.check);
  app.get("/docs.json", (_request, response) => response.json(openApiDocument));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use("/urls", createUrlRouter(urlController));
  app.use((_request, response) => response.status(404).json({ error: "Route not found" }));
  app.use(errorHandler);

  return app;
}
