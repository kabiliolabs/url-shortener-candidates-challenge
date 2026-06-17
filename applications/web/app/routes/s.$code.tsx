import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { resolveShortCode } from "@url-shortener/database";

export async function loader({ params }: Route.LoaderArgs) {
  const url = await resolveShortCode(params.code);

  if (!url) {
    throw new Response("Not Found", { status: 404 });
  }

  return redirect(url);
}