import { data, redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { UrlNotFoundError } from "@url-shortener/engine";
import { urlShortener } from "../lib/container.server";

export async function loader({ params }: Route.LoaderArgs) {
  try {
    // Resolving also counts the click.
    const url = await urlShortener.resolve(params.code);
    return redirect(url.originalUrl);
  } catch (error) {
    if (error instanceof UrlNotFoundError) {
      throw data("Short link not found", { status: 404 });
    }
    throw error;
  }
}