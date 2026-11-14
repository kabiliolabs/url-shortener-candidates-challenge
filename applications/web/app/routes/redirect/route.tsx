import { redirect } from "react-router";
import type { Route } from "./+types/route";
import { ResolveShortenedURLUseCase } from "@url-shortener/engine";

const resolveShortenedURL = new ResolveShortenedURLUseCase();

export function loader({ params }: Route.LoaderArgs) {
  const result = resolveShortenedURL.execute(params.code);

  if (!result.ok) {
    throw new Response(result.error.message, {
      status: result.error.code === "not_found" ? 404 : 400,
    });
  }

  return redirect(result.value);
}
