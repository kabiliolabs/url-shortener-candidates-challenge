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
