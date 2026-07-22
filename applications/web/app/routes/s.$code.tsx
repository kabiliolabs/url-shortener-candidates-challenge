import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { ApiError, resolveShortUrl } from "../lib/api.server";

export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params;

  if (!code) {
    throw new Response("Not Found", { status: 404 });
  }

  try {
    const { url } = await resolveShortUrl(code);
    return redirect(url);
  } catch (error) {
    if (error instanceof ApiError && error.message === "Short URL not found") {
      throw new Response("Not Found", { status: 404 });
    }
    throw new Response("Short URL service unavailable", { status: 503 });
  }
}
