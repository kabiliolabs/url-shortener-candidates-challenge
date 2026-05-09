import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { resolveShortCode } from "~/server/services/url-shortener.service";

export function loader({ params }: Route.LoaderArgs) {
  const { code } = params;

  const url = resolveShortCode(code);

  if (!url) {
    throw new Response("Not Found", { status: 404 });
  }

  return redirect(url);
}
