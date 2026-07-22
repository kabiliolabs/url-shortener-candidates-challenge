import type { Request, Response } from "express";

export class HealthController {
  check(_request: Request, response: Response): void {
    response.json({ status: "ok" });
  }
}
