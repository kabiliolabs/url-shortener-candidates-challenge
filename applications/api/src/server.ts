import { PrismaClient } from "@prisma/client";
import { loadConfiguration } from "./config.js";
import { HealthController } from "./controllers/health-controller.js";
import { UrlController } from "./controllers/url-controller.js";
import { generateShortCode } from "./domain/code-generator.js";
import { UrlService } from "./domain/url-service.js";
import { createApp } from "./http/server.js";
import { RateLimiter } from "./http/rate-limiter.js";
import { UrlRepository } from "./repositories/url-repository.js";

const configuration = loadConfiguration();

const prisma = new PrismaClient({
  datasources: { db: { url: configuration.mongoUrl } },
});
await prisma.$connect();

const repository = new UrlRepository(prisma);

const urlController = new UrlController(
  new UrlService(repository, generateShortCode),
  configuration.publicUrl,
  new RateLimiter(10, 60_000),
);
const app = createApp(
  new HealthController(),
  urlController,
);

const server = app.listen(configuration.port, () =>
  console.log(`API listening on port ${configuration.port}`),
);

async function shutdown(): Promise<void> {
  server.close();
  await prisma.$disconnect();
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
