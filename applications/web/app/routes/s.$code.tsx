import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import {
  findShortenedUrl,
  recordClick,
} from "~/domain/url-shortener.server";

export async function loader({ params }: Route.LoaderArgs) {
  const url = await findShortenedUrl(params.code);

  if (!url) {
    throw new Response("Not Found", { status: 404 });
  }

  recordClick(params.code!);

  return redirect(url);
}
