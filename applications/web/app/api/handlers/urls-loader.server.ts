import { list } from "../../services/shortened-url.server.js";
import { mapEntityToListDto } from "../../utils/server/url-list-dto.server.js";

/**
 * Handles GET /api/urls. Returns JSON Response. Server-only.
 */
export async function handleUrlsLoader(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const entities = await list();
  return Response.json({
    urls: entities.map(mapEntityToListDto),
  });
}
