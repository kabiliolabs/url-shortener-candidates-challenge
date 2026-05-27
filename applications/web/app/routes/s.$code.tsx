import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { isNotFoundShortUrlError } from "~/server/short-url-route-data.server";
import { resolveShortUrlForRequest } from "~/server/short-url.server";

export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params;

  try {
    const shortUrl = await resolveShortUrlForRequest({ code });

    return redirect(shortUrl.originalUrl);
  } catch (error) {
    if (isNotFoundShortUrlError(error)) {
      throw new Response("Not Found", { status: 404 });
    }

    throw error;
  }
}
