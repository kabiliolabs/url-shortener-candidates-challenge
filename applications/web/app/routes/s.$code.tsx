import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { resolveShortCode } from "~/server/services/url.service.server";
import { urlRepository, clickRepository } from "~/server/repositories/index.server";
import type { ClickMetadata } from "~/server/repositories/click.repository";
import { logger } from "~/server/lib/logger.server";

export async function loader({ params, request }: Route.LoaderArgs) {
  const { code } = params;

  const url = await resolveShortCode(code, urlRepository);

  if (!url) {
    throw new Response("Not Found", { status: 404 });
  }

  const metadata: ClickMetadata = {
    ipAddress:
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      undefined,
    userAgent: request.headers.get("user-agent") || undefined,
    referer: request.headers.get("referer") || undefined,
  };

  // Fire-and-forget click tracking
  clickRepository
    .recordClick(url.id, metadata)
    .catch((err) => logger.error({ err }, "Failed to record click"));

  return redirect(url.originalUrl);
}
