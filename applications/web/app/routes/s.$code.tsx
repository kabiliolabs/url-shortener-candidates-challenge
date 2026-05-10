import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { resolveShortCode } from "~/server/services/url.service.server";
import { urlRepository, clickRepository } from "~/server/repositories/index.server";
import type { ClickMetadata } from "~/server/repositories/click.repository";
import { getCachedUrl, setCachedUrl, invalidateCachedUrl } from "~/server/services/cache.service.server";
import { logger } from "~/server/lib/logger.server";

export async function loader({ params, request }: Route.LoaderArgs) {
  const { code } = params;

  let originalUrl: string | undefined;
  let urlId: number | undefined;

  // Cache-first lookup
  const cached = await getCachedUrl(code);

  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        typeof parsed.id === "number" &&
        typeof parsed.originalUrl === "string"
      ) {
        urlId = parsed.id;
        originalUrl = parsed.originalUrl;
      } else {
        logger.warn({ code }, "Invalid cache shape, invalidating");
        await invalidateCachedUrl(code);
      }
    } catch (err) {
      logger.warn({ err, code }, "Corrupted cache entry, invalidating");
      invalidateCachedUrl(code).catch(() => {});
    }
  }

  if (!originalUrl) {
    const url = await resolveShortCode(code, urlRepository);

    if (!url) {
      throw new Response("Not Found", { status: 404 });
    }

    originalUrl = url.originalUrl;
    urlId = url.id;

    // Populate cache (fire-and-forget)
    setCachedUrl(code, JSON.stringify({ id: url.id, originalUrl: url.originalUrl }));
  }

  const metadata: ClickMetadata = {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined,
    userAgent: request.headers.get("user-agent") || undefined,
    referer: request.headers.get("referer") || undefined,
  };

  if (!originalUrl || urlId === undefined) {
    throw new Response("Not Found", { status: 404 });
  }

  // Fire-and-forget click tracking (runs on both cache hit and miss)
  clickRepository
    .recordClick(urlId, metadata)
    .catch((err) => logger.error({ err }, "Failed to record click"));

  return redirect(originalUrl);
}
