import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import {
  InvalidShortCodeError,
  ShortUrlNotFoundError,
} from "@url-shortener/engine";
import { services } from "../server/container.server";

export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params;

  if (!code) {
    throw new Response("Short code is required.", { status: 400 });
  }

  try {
    await services.resolveShortUrl.execute({ code });
    return redirect("/");
  } catch (error) {
    if (error instanceof InvalidShortCodeError) {
      throw new Response(error.message, { status: 400 });
    }

    if (error instanceof ShortUrlNotFoundError) {
      throw new Response("Short URL not found.", { status: 404 });
    }

    throw error;
  }
}
