import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { ShortUrlNotFoundError } from "@url-shortener/engine";
import { shortUrlService } from "~/lib/short-url-service.server";

export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params;

  if (!code) {
    throw new Response("Not Found", { status: 404 });
  }

  try {
    const destination = await shortUrlService.recordClickAndResolve(code);
    return redirect(destination);
  } catch (error) {
    if (error instanceof ShortUrlNotFoundError) {
      throw new Response("Not Found", { status: 404 });
    }
    throw error;
  }
}
