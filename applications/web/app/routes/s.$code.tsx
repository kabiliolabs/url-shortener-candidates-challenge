import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { AppError } from "@url-shortener/engine";
import { urlShortenerContainer } from "~/server/url-shortener-container.server";

export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params;

  try {
    const redirectTo = await urlShortenerContainer.redirectToOriginalUrlUseCase.execute({
      shortCode: code,
    });

    await urlShortenerContainer.trackClickUseCase.execute({
      shortCode: code,
      clickedAt: new Date(),
    });

    return redirect(redirectTo.originalUrl);
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) {
      throw new Response("Not Found", { status: 404 });
    }

    throw new Response("Unable to redirect right now", { status: 500 });
  }
}
