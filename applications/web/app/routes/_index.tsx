import { AppError } from "@url-shortener/engine";
import { useActionData } from "react-router";
import type { Route } from "./+types/_index";
import { z } from "zod";
import { ShortenedUrlResult } from "~/features/url-shortener/components/shortened-url-result";
import { UrlShortenerForm } from "~/features/url-shortener/components/url-shortener-form";
import { UrlStatsTable } from "~/features/url-stats/components/url-stats-table";
import { resolveBaseUrl } from "~/server/base-url.server";
import { getRequestClientKey } from "~/server/request.server";
import { urlShortenerContainer } from "~/server/url-shortener-container.server";

const createUrlSchema = z.object({
  url: z.string().trim().url("Please provide a valid URL."),
});

type ActionData = {
  shortenedUrl?: string;
  error?: {
    code: string;
    message: string;
  };
};

export async function loader({ request }: Route.LoaderArgs) {
  const baseUrl = resolveBaseUrl(request);
  const stats = await urlShortenerContainer.getUrlStatsUseCase.execute({ limit: 20 });

  return {
    baseUrl,
    stats: stats.map((item) => ({
      shortCode: item.shortCode,
      originalUrl: item.originalUrl,
      clickCount: item.clickCount,
      createdAt: item.createdAt.toISOString(),
      lastClickedAt: item.lastClickedAt?.toISOString() ?? null,
    })),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const baseUrl = resolveBaseUrl(request);

  try {
    const clientKey = getRequestClientKey(request);
    urlShortenerContainer.rateLimiter.consume(clientKey);

  const formData = await request.formData();
    const result = createUrlSchema.safeParse({
      url: formData.get("url"),
    });

    if (!result.success) {
      return {
        error: {
          code: "VALIDATION_ERROR",
          message: result.error.issues[0]?.message ?? "Invalid URL.",
        },
      } satisfies ActionData;
    }

    const created = await urlShortenerContainer.createShortUrlUseCase.execute({
      originalUrl: result.data.url,
    });

    return {
      shortenedUrl: `${baseUrl}/s/${created.shortCode}`,
    } satisfies ActionData;
  } catch (error) {
    if (error instanceof AppError) {
      return {
        error: {
          code: error.code,
          message: error.message,
        },
      } satisfies ActionData;
    }

    return {
      error: {
        code: "INTERNAL_ERROR",
        message: "Unexpected error while creating short URL.",
      },
    } satisfies ActionData;
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const actionData = useActionData<ActionData>();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dbeafe,_transparent_50%),radial-gradient(circle_at_bottom_right,_#cffafe,_transparent_40%),linear-gradient(#f8fafc,#eef2ff)] px-4 py-10">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <UrlShortenerForm error={actionData?.error?.message} />
          {actionData?.shortenedUrl && (
            <ShortenedUrlResult shortUrl={actionData.shortenedUrl} />
          )}
        </div>
        <UrlStatsTable rows={loaderData.stats} baseUrl={loaderData.baseUrl} />
      </div>
    </main>
  );
}
