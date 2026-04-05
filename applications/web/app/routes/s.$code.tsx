import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { findShortenedUrl } from "~/domain/url-shortener.server";

export function loader({ params }: Route.LoaderArgs) {
  const url = findShortenedUrl(params.code);

  if (!url) {
    throw new Response("Not Found", { status: 404 });
  }

  return redirect(url);
}
