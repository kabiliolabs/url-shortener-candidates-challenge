import { ShortUrlNotFoundError } from "@url-shortener/engine";
import { data, redirect } from "react-router";
import { resolveShortUrl } from "~/.server/container";
import type { Route } from "./+types/s.$code";

/** Redirects to the original URL and counts the click (SPEC-004). */
export async function loader({ params }: Route.LoaderArgs) {
  try {
    const { originalUrl } = await resolveShortUrl.execute(params.code);
    // 302 + no-store so browsers come back every time and every click is counted.
    return redirect(originalUrl, { status: 302, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ShortUrlNotFoundError) {
      throw data("This short link doesn't exist.", { status: 404 });
    }
    throw error;
  }
}
