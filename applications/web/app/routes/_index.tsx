import { data } from "react-router";
import type { Route } from "./+types/_index";
import { InvalidUrlError } from "@url-shortener/engine";
import { ShortenForm, type ShortenResult } from "~/components/shorten-form";
import {
  ShortUrlsTable,
  type ShortUrlRow,
} from "~/components/short-urls-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  clientKeyFor,
  creationRateLimiter,
  listShortUrls,
  shortenUrl,
  shortUrlBase,
  shortUrlFor,
} from "~/services.server";

export async function loader() {
  return { shortUrlBase, shortUrls: await loadShortUrls() };
}

// The list is secondary to the form. If it cannot be loaded the page still
// renders, with null telling the component to say so instead of crashing.
async function loadShortUrls(): Promise<ShortUrlRow[] | null> {
  try {
    const shortUrls = await listShortUrls.execute();
    return shortUrls.map((shortUrl) => ({
      ...shortUrl,
      shortUrl: shortUrlFor(shortUrl.code),
    }));
  } catch (error) {
    console.error("Failed to list short URLs", error);
    return null;
  }
}

export async function action({ request }: Route.ActionArgs) {
  // Checked first, so every attempt counts, valid or not: otherwise the limit
  // could be dodged by sending input that fails validation.
  const limit = creationRateLimiter.tryConsume(clientKeyFor(request));
  if (!limit.allowed) {
    return data<ShortenResult>(
      {
        shortenedUrl: null,
        error: `Too many links created. Try again in ${limit.retryAfterSeconds} seconds.`,
        invalidUrl: false,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  const formData = await request.formData();
  const field = formData.get("url");
  // A missing field or a file upload is treated as empty input, which the
  // domain rejects with its own message.
  const rawUrl = typeof field === "string" ? field : "";

  try {
    const shortUrl = await shortenUrl.execute(rawUrl);
    return data<ShortenResult>({
      shortenedUrl: shortUrlFor(shortUrl.code),
      error: null,
      invalidUrl: false,
    });
  } catch (error) {
    if (error instanceof InvalidUrlError) {
      return data<ShortenResult>(
        { shortenedUrl: null, error: error.message, invalidUrl: true },
        { status: 400 },
      );
    }
    // Returned instead of rethrown so the form stays on screen. The details go
    // to the log only: database errors can reveal internals.
    console.error("Failed to shorten URL", error);
    return data<ShortenResult>(
      {
        shortenedUrl: null,
        error: "Something went wrong. Please try again.",
        invalidUrl: false,
      },
      { status: 500 },
    );
  }
}

// React Router drops headers set by an action from the page response unless
// the route forwards them. Without this, Retry-After would only reach requests
// made by the fetcher, not a plain form submission.
export function headers({ actionHeaders }: Route.HeadersArgs) {
  return actionHeaders;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { shortUrlBase, shortUrls } = loaderData;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">URL Shortener</h1>
        <p className="text-muted-foreground">
          Paste a long link and get a short one you can share.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Shorten a link</CardTitle>
        </CardHeader>
        <CardContent>
          <ShortenForm shortUrlBase={shortUrlBase} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latest links</CardTitle>
          <CardDescription>
            The most recently created links, newest first, with their clicks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shortUrls ? (
            <ShortUrlsTable shortUrls={shortUrls} />
          ) : (
            <p role="alert" className="py-6 text-center text-sm">
              The list couldn't be loaded right now. You can still shorten
              links, and the list will be back when you reload the page.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
