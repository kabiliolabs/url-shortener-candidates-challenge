import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { GetUrlUseCase, TrackClickUseCase } from "@url-shortener/engine";
import { PrismaUrlRepository } from "../infrastructure/prisma-url-repository";

export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params;
  const repository = new PrismaUrlRepository();
  const getUrl = new GetUrlUseCase(repository);
  const trackClick = new TrackClickUseCase(repository);

  const shortenedUrl = await getUrl.execute(code);

  if (!shortenedUrl) {
    throw new Response("Not Found", { status: 404 });
  }

  await trackClick.execute(code);

  return redirect(shortenedUrl.originalUrl.value);
}
