import { useActionData } from "react-router";
import type { Route } from "./+types/_index";
import { ShortenedUrlResult } from "~/components/shortened-url-result";
import { UrlList } from "~/components/url-list";
import { UrlShortenerForm } from "~/components/url-shortener-form";
import {
  createShortenedUrl,
  getFormError,
  toShortUrlListItem,
} from "~/server/short-url-route-data.server";
import {
  createShortUrlForRequest,
  listShortUrlsForRequest,
} from "~/server/short-url.server";
import {
  assertCreateShortUrlRequestIsAllowed,
  assertUrlDoesNotPointToShortener,
} from "~/server/security.server";

export async function loader() {
  const shortUrls = await listShortUrlsForRequest();

  return {
    baseUrl: createShortenedUrl(""),
    shortUrls: shortUrls.map(toShortUrlListItem),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const url = formData.get("url");

  if (typeof url !== "string") {
    return { error: "URL is required" };
  }

  try {
    assertCreateShortUrlRequestIsAllowed(request);
    assertUrlDoesNotPointToShortener(url);

    const shortUrl = await createShortUrlForRequest({ originalUrl: url });

    return {
      shortenedUrl: createShortenedUrl(shortUrl.code),
    };
  } catch (error) {
    const formError = getFormError(error);

    if (formError) {
      return { error: formError };
    }

    throw error;
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { baseUrl, shortUrls } = loaderData;
  const actionData = useActionData<typeof action>();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-5xl gap-8">
        <header className="grid gap-2">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            URL shortener
          </p>
          <h1 className="text-3xl font-semibold text-zinc-950 sm:text-4xl">
            Create and track short links
          </h1>
        </header>

        <section className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <UrlShortenerForm baseUrl={baseUrl} error={actionData?.error} />
          <ShortenedUrlResult shortenedUrl={actionData?.shortenedUrl} />
        </section>

        <UrlList shortUrls={shortUrls} />
      </div>
    </main>
  );
}
