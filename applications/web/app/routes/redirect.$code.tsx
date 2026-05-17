import { redirect } from "react-router";
import type { Route } from "./+types/redirect.$code";
import { UrlNotFoundError } from "@url-shortener/engine";
import { makeTrackClickUseCase } from "../infrastructure/container";

export async function loader({ params }: Route.LoaderArgs) {
  const trackClick = makeTrackClickUseCase();

  try {
    const url = await trackClick.execute(params.code);
    return redirect(url.originalUrl.value);
  } catch (err) {
    if (err instanceof UrlNotFoundError) {
      throw new Response("Not Found", { status: 404 });
    }
    throw err;
  }
}
