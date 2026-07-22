import type { Navigation } from "react-router";
import type { HomeActionData, HomeLoaderData, HomePageState } from "./contracts";

interface HomePageStateInput {
  loaderData: HomeLoaderData;
  actionData: HomeActionData | undefined;
  navigation: Pick<Navigation, "state" | "formMethod" | "formData">;
}

export function createHomePageState({
  loaderData,
  actionData,
  navigation,
}: HomePageStateInput): HomePageState {
  const isSubmitting =
    navigation.state === "submitting" && navigation.formMethod?.toLowerCase() === "post";
  const pendingUrlValue = navigation.formData?.get("url");
  const inputValue = typeof pendingUrlValue === "string"
    ? pendingUrlValue
    : (actionData?.submittedUrl ?? "");
  const trackedClicks = loaderData.recentUrls.reduce((sum, url) => sum + url.clicks, 0);
  const latestShortUrl = loaderData.recentUrls[0]?.shortUrl ?? null;

  return {
    hero: {
      title: "Shorten links, track clicks, and keep the latest URLs within reach.",
      description:
        "Create branded-looking short links in seconds, share them immediately, and monitor recent activity from one place.",
    },
    summary: {
      baseUrl: loaderData.baseUrl,
      recentUrlCount: loaderData.recentUrls.length,
      trackedClicks,
    },
    form: {
      baseUrl: loaderData.baseUrl,
      inputValue,
      isSubmitting,
      error: actionData?.error ?? null,
      helperText: isSubmitting
        ? "Sending request to the backend and refreshing your recent URLs."
        : "The latest links and click counts update from the backend list below.",
    },
    result: {
      shortenedUrl: actionData?.shortenedUrl ?? null,
      fallbackShortUrl: latestShortUrl,
    },
    recentUrls: {
      items: loaderData.recentUrls,
      error: loaderData.recentUrlsError,
    },
  };
}