import type { Route } from "./+types/api.urls";
import {
  baseUrl,
  shortenerApp,
  toErrorResponse,
  withSecurityHeaders,
} from "@url-shortener/engine";

function numberParam(url: URL, name: string): number | undefined {
  const value = url.searchParams.get(name);
  return value === null ? undefined : Number(value);
}

export async function loader({ request }: Route.LoaderArgs) {
  return withSecurityHeaders(await listUrls(request), request);
}

async function listUrls(request: Request): Promise<Response> {
  const url = new URL(request.url);

  try {
    const page = await shortenerApp.listUrlsWithStats.execute({
      limit: numberParam(url, "limit"),
      offset: numberParam(url, "offset"),
    });

    return Response.json({
      ...page,
      urls: page.urls.map((shortUrl) => ({
        code: shortUrl.code,
        shortUrl: `${baseUrl}/s/${shortUrl.code}`,
        originalUrl: shortUrl.originalUrl,
        clicks: shortUrl.clickCount,
        createdAt: shortUrl.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
