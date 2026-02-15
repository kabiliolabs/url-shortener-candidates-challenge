import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { resolveAndTrackClick } from "../services/shortened-url.server.js";

export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params;

  const url = await resolveAndTrackClick(code);

  if (!url) {
    throw new Response("Not Found", { status: 404 });
  }

  return redirect(url);
}
