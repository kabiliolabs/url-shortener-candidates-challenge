import { data, redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { followShortUrl } from "~/.server/container";

export async function loader({ params }: Route.LoaderArgs) {
  const originalUrl = await followShortUrl.execute(params.code);

  if (!originalUrl) {
    throw data("Short link not found", { status: 404 });
  }

  // 302, not 301: browsers cache permanent redirects and those visits would never be counted.
  return redirect(originalUrl, 302);
}

// Never rendered (the loader always redirects or throws), but a default export makes this a UI route
// instead of a resource route, so a 404 renders the root ErrorBoundary rather than a bare text response.
export default function ShortLinkRedirect() {
  return null;
}
