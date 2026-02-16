import { list } from "../services/shortened-url.server.js";
import { mapEntityToListDto } from "../utils/url-list-dto.server.js";
import { httpResponse } from "../utils/http-response.server.js";
import { SERVER_MESSAGES } from "../constants.js";

/**
 * Handles GET /api/urls. Returns JSON Response. Server-only.
 */
export async function handleUrlsLoader(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return httpResponse.methodNotAllowed();
  }

  try {
    const entities = await list();
    return httpResponse.ok({ urls: entities.map(mapEntityToListDto) });
  } catch {
    return httpResponse.error(SERVER_MESSAGES.LIST_LOAD_ERROR, 500);
  }
}
