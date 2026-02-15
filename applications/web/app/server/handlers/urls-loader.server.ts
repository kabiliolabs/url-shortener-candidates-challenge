import { list } from "../services/shortened-url.server.js";
import { mapEntityToListDto } from "../utils/url-list-dto.server.js";
import { httpResponse } from "../utils/http-response.server.js";

const LIST_ERROR_MESSAGE =
  "The list of URLs could not be loaded. Please try again later.";

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
    return httpResponse.error(LIST_ERROR_MESSAGE, 500);
  }
}
