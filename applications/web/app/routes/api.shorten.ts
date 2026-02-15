import { handleShortenAction } from "../api/handlers/shorten-action.server.js";

export async function action({ request }: { request: Request }) {
  return handleShortenAction(request);
}
