import type { Route } from "../../+types/root";
import { logger } from "../lib/logger.server";

export const loggingMiddleware: Route.MiddlewareFunction = async (
  { request },
  next
) => {
  const reqId = crypto.randomUUID();
  const start = performance.now();
  const url = new URL(request.url);
  const log = logger.child({ reqId });

  log.info(
    { method: request.method, path: url.pathname },
    "incoming request"
  );

  const response = await next();
  const duration = Math.round(performance.now() - start);

  const logLevel =
    response.status >= 500
      ? "error"
      : response.status >= 400
        ? "warn"
        : "info";
  log[logLevel]({ status: response.status, duration }, "request completed");

  response.headers.set("X-Request-Id", reqId);
  return response;
};
