import type { Route } from "./+types/api.track-click.$code";
import { makeTrackClickUseCase } from "../infrastructure/container";

export async function action({ params }: Route.ActionArgs) {
  const trackClick = makeTrackClickUseCase();
  await trackClick.execute(params.code);
  return null;
}
