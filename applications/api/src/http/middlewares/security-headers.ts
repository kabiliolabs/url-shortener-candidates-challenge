import type { NextFunction, Request, Response } from "express";

export function setSecurityHeaders(_request: Request, response: Response, next: NextFunction): void {
  response.set({
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  });
  next();
}
