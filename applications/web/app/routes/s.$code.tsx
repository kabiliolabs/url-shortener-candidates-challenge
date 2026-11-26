import { resolveCode } from "@url-shortener/engine";
import { redirect } from "react-router";
import { shortLinkRepository } from "~/prisma-short-link-repository.server";
import type { Route } from "./+types/s.$code";

export async function loader({ params }: Route.LoaderArgs) {
  const url = await resolveCode(shortLinkRepository, params.code);

  if (!url) {
    throw new Response("Not Found", { status: 404 });
  }

  return redirect(url, 302);
}
