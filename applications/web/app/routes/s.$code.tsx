import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { findByCode } from "@url-shortener/engine";

export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params;

  const url = await findByCode(code);

  if (!url) {
    throw new Response("Not Found", { status: 404 });
  }

  return redirect(url.originalUrl);
}
