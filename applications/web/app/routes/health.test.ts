import { describe, expect, it, vi } from "vitest";
import type { Route } from "./+types/health";

async function loadWithDatabase(healthy: boolean) {
  vi.resetModules();
  vi.doMock("@url-shortener/engine", () => ({
    isDatabaseHealthy: async () => healthy,
    prisma: {},
    withSecurityHeaders: (response: Response) => response,
  }));
  const { loader } = await import("./health");

  return loader({
    request: new Request("http://localhost/health"),
  } as Route.LoaderArgs);
}

describe("GET /health", () => {
  it("returns 200 and a healthy status when the database is reachable", async () => {
    const result = await loadWithDatabase(true);

    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ status: "healthy" });
  });

  it("returns 503 and an unhealthy status when the database is unreachable, without throwing", async () => {
    const result = await loadWithDatabase(false);

    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ status: "unhealthy" });
  });
});
