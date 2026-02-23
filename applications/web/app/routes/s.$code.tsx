import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { toHttpResponse } from "../server/http-error.server";
import { urlShortenerApplication } from "../server/url-shortener.server";

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const result = await urlShortenerApplication.resolveShortLink({
      code: params.code,
    });

    return redirect(result.destinationUrl);
  } catch (error) {
    throw toHttpResponse(error);
  }
}
