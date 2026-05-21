import { getEngine } from "~/lib/engine.server";

export async function loader() {
  const engine = getEngine();
  const health = await engine.healthCheck();
  const ok = health.db && health.redis;
  return Response.json(
    { ok, ...health },
    {
      status: ok ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
