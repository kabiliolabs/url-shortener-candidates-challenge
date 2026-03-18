import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { resolveUrl } from "~/server/container";

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const longUrl = await resolveUrl.execute(params.code);
    return redirect(longUrl.value);
  } catch {
    throw new Response("Not Found", { status: 404 });
  }
}
