import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { resolveUrl, incrementClicks } from "~/server/container";

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const longUrl = await resolveUrl.execute(params.code);
    await incrementClicks(params.code);
    return redirect(longUrl.value);
  } catch {
    throw new Response("Not Found", { status: 404 });
  }
}
