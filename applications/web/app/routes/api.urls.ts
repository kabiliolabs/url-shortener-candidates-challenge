import { handleUrlsLoader } from "../server/handlers/urls-loader.server.js";

export async function loader({ request }: { request: Request }) {
  return handleUrlsLoader(request);
}
