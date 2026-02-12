import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { urlService } from "~/lib/url-service.server";

/**
 * Short URL Redirect Handler
 * 
 * Resolves short codes to original URLs and redirects the user.
 * Records click analytics asynchronously to avoid slowing down redirects.
 */
export async function loader({ params, request }: Route.LoaderArgs) {
  const { code } = params;

  const originalUrl = await urlService.resolveShortCode(code);

  if (!originalUrl) {
    throw new Response("Short URL not found", { status: 404 });
  }

  // Record click analytics asynchronously (don't await to avoid slowing redirect)
  const userAgent = request.headers.get("user-agent") ?? undefined;
  const referer = request.headers.get("referer") ?? undefined;
  
  // Fire and forget - errors are logged but don't block the redirect
  urlService.recordClick(code, userAgent, referer).catch((error) => {
    console.error("Error recording click:", error);
  });

  // 302 (temporary redirect) is used instead of 301 (permanent) 
  // to ensure browsers always check the server, allowing click tracking
  return redirect(originalUrl, 302);
}
