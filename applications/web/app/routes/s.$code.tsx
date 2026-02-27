import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { getShortenedUrl, incrementClicks } from "@url-shortener/engine";

export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params;

  const result = await getShortenedUrl(code);

  if (!result) {
    throw new Response("Not Found", { status: 404 });
  } else {
    // Increment clicks in the background
    incrementClicks(code);
  }

  return redirect(result.originalUrl);
}
