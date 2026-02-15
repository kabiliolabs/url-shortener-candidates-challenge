import { handleUrlsLoader } from "../api/handlers/urls-loader.server.js";

export async function loader({ request }: { request: Request }) {
  return handleUrlsLoader(request);
}
