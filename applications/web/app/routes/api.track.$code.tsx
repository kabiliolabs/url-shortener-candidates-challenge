import type { Route } from "./+types/api.track.$code";
import { TrackClickUseCase } from "@url-shortener/engine";
import { PrismaUrlRepository } from "../infrastructure/prisma-url-repository";

export async function action({ params }: Route.ActionArgs) {
  const repository = new PrismaUrlRepository();
  const trackClick = new TrackClickUseCase(repository);
  await trackClick.execute(params.code);
  return null;
}
