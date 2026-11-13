import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { shortenedUrlService } from "../services/shortened-url.server";

/** Registra el clic del enlace y redirige al destino, o devuelve 404 si no existe. */
export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params;

  const shortenedUrl =
    await shortenedUrlService.findByCodeAndRecordClick(code);

  if (!shortenedUrl) {
    throw new Response("Not Found", { status: 404 });
  }

  return redirect(shortenedUrl.originalUrl);
}
