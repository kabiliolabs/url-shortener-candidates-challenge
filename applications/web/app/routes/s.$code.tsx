import { redirect } from "react-router";
import { ShortUrlNotFound } from "@url-shortener/engine";
import type { Route } from "./+types/s.$code";
import { resolveShortUrl } from "~/services.server";

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const originalUrl = await resolveShortUrl.execute(params.code);
    // 302 and not 301: browsers cache permanent redirects, and later clicks
    // would skip the server and never be counted.
    return redirect(originalUrl, 302);
  } catch (error) {
    if (error instanceof ShortUrlNotFound) {
      throw new Response("Not Found", { status: 404 });
    }
    throw error;
  }
}
