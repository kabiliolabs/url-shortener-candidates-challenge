import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { RedirectUseCase, RedisUrlRepository } from "@url-shortener/engine";

export async function loader({ params }: Route.LoaderArgs) {
  const repo = new RedisUrlRepository();
  const useCase = new RedirectUseCase(repo);
  const targetUrl = await useCase.execute(params.code!);
  if (!targetUrl) {
    throw new Response("Not Found", { status: 404 });
  }
  return redirect(targetUrl);
}
