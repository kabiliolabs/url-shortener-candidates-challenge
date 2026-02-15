import { redirect } from "react-router";
import { resolveAndTrackClick } from "../services/shortened-url.server.js";

/**
 * Loader logic for /s/:code. Resolves the code and redirects, or throws 404.
 * Use in route: export const loader = ({ params }) => loadShortCodeRedirect(params.code);
 */
export async function loadShortCodeRedirect(code: string): Promise<Response> {
  const url = await resolveAndTrackClick(code);
  if (!url) {
    throw new Response("Not Found", { status: 404 });
  }
  return redirect(url);
}
