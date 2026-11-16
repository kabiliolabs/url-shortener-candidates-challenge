import type { Route } from "./+types/health";
import { isDatabaseHealthy, prisma, withSecurityHeaders } from "@url-shortener/engine";

export async function loader({ request }: Route.LoaderArgs) {
  const healthy = await isDatabaseHealthy(prisma);

  const response = new Response(
    JSON.stringify({ status: healthy ? "healthy" : "unhealthy" }),
    {
      status: healthy ? 200 : 503,
      headers: { "Content-Type": "application/json" },
    },
  );
  return withSecurityHeaders(response, request);
}
