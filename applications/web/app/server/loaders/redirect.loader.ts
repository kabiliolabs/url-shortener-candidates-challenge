import { redirect } from "react-router";
import { urlShortenerService } from "../services/url-shortener.service";

export async function redirectLoader({ params }: { params: { code: string } }) {
  const { code } = params;

  const originalUrl = await urlShortenerService.getOriginalUrl(code);

  if (!originalUrl) {
    throw new Response("Not Found", { status: 404 });
  }

  // Track the click before redirecting
  await urlShortenerService.trackClick(code);

  return redirect(originalUrl);
}
