import { redirect } from "react-router";
import type { Route } from "./+types/redirect.$code";
import {
  GetUrlUseCase,
  TrackClickUseCase,
  UrlNotFoundError,
} from "@url-shortener/engine";
import { PrismaUrlRepository } from "../infrastructure/prisma-url-repository";

export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params;
  const repository = new PrismaUrlRepository();
  const getUrl = new GetUrlUseCase(repository);
  const trackClick = new TrackClickUseCase(repository);

  try {
    const shortenedUrl = await getUrl.execute(code);
    await trackClick.execute(code);
    return redirect(shortenedUrl.originalUrl.value);
  } catch (err) {
    if (err instanceof UrlNotFoundError) {
      throw new Response("Not Found", { status: 404 });
    }
    throw err;
  }
}
