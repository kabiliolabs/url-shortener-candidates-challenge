import type { ErrorRequestHandler } from "express";
import { NotFoundError, ValidationError } from "../../domain/errors.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ValidationError) {
    response.status(400).json({ error: error.message });
    return;
  }
  if (error instanceof NotFoundError) {
    response.status(404).json({ error: error.message });
    return;
  }
  if (error instanceof SyntaxError) {
    response.status(400).json({ error: "Request body must be valid JSON" });
    return;
  }
  if (typeof error === "object" && error && "type" in error && error.type === "entity.too.large") {
    response.status(413).json({ error: "Request body must be at most 10 KB" });
    return;
  }

  console.error("Unhandled API error", error);
  response.status(500).json({ error: "Internal server error" });
};
