import { CodeNotFoundError } from "@url-shortener/engine";
import { redirect } from "react-router";
import { getEngine } from "~/lib/engine.server";
import type { Route } from "./+types/s.$code";

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const longUrl = await getEngine().resolveShortCode(params.code);
    return redirect(longUrl);
  } catch (err) {
    if (err instanceof CodeNotFoundError) {
      throw new Response("Short link not found", { status: 404 });
    }
    throw err;
  }
}
