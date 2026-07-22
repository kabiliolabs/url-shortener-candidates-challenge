import express, { type Router } from "express";
import { UrlController } from "../../controllers/url-controller.js";

export function createUrlRouter(controller: UrlController): Router {
  const router = express.Router();

  router.post("/", controller.create);
  router.get("/", controller.getAll);
  router.get("/:code", controller.getById);

  return router;
}
