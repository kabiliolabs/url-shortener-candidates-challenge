import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { InvalidShortCodeError } from "@url-shortener/engine";
import { resolveShortUrl } from "../.server/short-url";

export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params;

  let resolved;
  try {
    resolved = await resolveShortUrl(code);
  } catch (error) {
    if (error instanceof InvalidShortCodeError) {
      throw new Response("Not Found", { status: 404 });
    }
    throw error;
  }

  if (!resolved) {
    throw new Response("Not Found", { status: 404 });
  }

  return redirect(resolved.originalUrl);
}
