import { redirect } from "react-router";
import { ApiError, resolveShortUrl } from "../../lib/api.server";

export async function resolveShortCode(code: string) {
  const { url } = await resolveShortUrl(code);
  return redirect(url);
}

export function toShortCodeErrorResponse(error: unknown): Response {
  if (error instanceof ApiError && error.status === 404) {
    return new Response("This short URL does not exist anymore.", {
      status: 404,
      statusText: "Short URL not found",
    });
  }

  return new Response(
    "The URL service could not resolve this short link right now. Please try again shortly.",
    {
      status: 503,
      statusText: "Short URL service unavailable",
    },
  );
}