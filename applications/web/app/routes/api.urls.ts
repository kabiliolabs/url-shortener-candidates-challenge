import type { Route } from "./+types/api.urls";
import { list } from "../services/shortened-url.server.js";

export async function loader({ request }: Route.LoaderArgs) {
  if (request.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const urls = await list();
  return Response.json({
    urls: urls.map((u) => ({
      id: u.id,
      code: u.code,
      url: u.url,
      createdAt: u.createdAt.toISOString(),
      clickCount: u.clickCount,
    })),
  });
}

export default function ApiUrls() {
  return null;
}
