import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import {
  shortenerApp,
  toErrorResponse,
  withSecurityHeaders,
} from "@url-shortener/engine";

export async function loader({ params, request }: Route.LoaderArgs) {
  const { code } = params;

  try {
    const shortUrl = await shortenerApp.resolveAndTrackClick.execute(code);
    // Never 301: browsers cache it and skip the server, undercounting clicks.
    return withSecurityHeaders(redirect(shortUrl.originalUrl, 302), request);
  } catch (error) {
    throw withSecurityHeaders(toErrorResponse(error), request);
  }
}
