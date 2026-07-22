import { baseUrl } from "@url-shortener/engine";
import { ApiError, createShortUrl, listShortUrls } from "../../lib/api.server";
import type { HomeActionData, HomeLoaderData } from "./contracts";

const baseShortUrl = baseUrl ? `${baseUrl}/s/` : "-";

export async function loadHomeData(): Promise<HomeLoaderData> {
  try {
    const recentUrls = await listShortUrls();

    return {
      baseUrl: baseShortUrl,
      recentUrls,
      recentUrlsError: null,
    };
  } catch (error) {
    return {
      baseUrl: baseShortUrl,
      recentUrls: [],
      recentUrlsError:
        error instanceof ApiError
          ? error.message
          : "Unable to load recent shortened URLs right now.",
    };
  }
}

export async function submitShortUrlForm(request: Request): Promise<HomeActionData> {
  const formData = await request.formData();
  const url = formData.get("url");

  if (typeof url !== "string" || url.trim().length === 0) {
    return {
      error: "URL is required.",
      shortenedUrl: null,
      submittedUrl: "",
    };
  }

  try {
    return {
      error: null,
      shortenedUrl: (await createShortUrl(url)).shortUrl,
      submittedUrl: "",
    };
  } catch (error) {
    return {
      shortenedUrl: null,
      error: error instanceof ApiError ? error.message : "Unable to shorten this URL. Please try again.",
      submittedUrl: url,
    };
  }
}