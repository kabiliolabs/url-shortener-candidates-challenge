import { data, useActionData, useLoaderData } from "react-router";
import type { Route } from "./+types/_index";
import { InvalidUrlError, RetryExhaustedError } from "@url-shortener/engine";
import {
  buildShortUrl,
  getPublicBaseUrl,
  getUrlRepository,
  getUrlShortener,
} from "~/.server/container";
import { checkRateLimit, getClientIp } from "~/.server/rate-limit";
import { UrlForm } from "~/components/url-form";
import { UrlList, type UrlListItem } from "~/components/url-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "~/components/ui/alert";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    {
      name: "description",
      content: "Shorten your URLs quickly and track clicks",
    },
  ];
}

export async function loader(_: Route.LoaderArgs) {
  const urls = await getUrlRepository().list();
  const items: UrlListItem[] = urls.map((u) => ({
    code: u.code,
    originalUrl: u.originalUrl,
    shortUrl: buildShortUrl(u.code),
    clickCount: u.clickCount,
    lastClickedAt: u.lastClickedAt ? u.lastClickedAt.toISOString() : null,
    createdAt: u.createdAt.toISOString(),
  }));
  return { urls: items, baseUrl: getPublicBaseUrl() };
}

export async function action({ request }: Route.ActionArgs) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return data(
      { error: `Too many requests. Try again in ${limit.retryAfterSeconds}s.` },
      { status: 429 },
    );
  }

  const formData = await request.formData();
  const url = String(formData.get("url") ?? "");

  try {
    const created = await getUrlShortener().shorten(url);
    return { shortUrl: buildShortUrl(created.code), code: created.code };
  } catch (error) {
    if (error instanceof InvalidUrlError) {
      return data({ error: error.message }, { status: 400 });
    }
    if (error instanceof RetryExhaustedError) {
      return data(
        { error: "Could not generate a unique code. Please try again." },
        { status: 503 },
      );
    }
    console.error("Failed to shorten URL", error);
    return data(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

export default function Index() {
  const { urls, baseUrl } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const shortUrl =
    actionData && "shortUrl" in actionData ? actionData.shortUrl : undefined;
  const error =
    actionData && "error" in actionData ? actionData.error : undefined;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">URL Shortener</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Paste a long URL to get a short link. Links start with {baseUrl}/s/
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Shorten a URL</CardTitle>
          <CardDescription>Only http and https links are allowed.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <UrlForm error={error} />
          {shortUrl && (
            <Alert variant="success">
              <AlertTitle>Your short link is ready</AlertTitle>
              <AlertDescription>
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono underline underline-offset-4 break-all"
                >
                  {shortUrl}
                </a>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your links</CardTitle>
          <CardDescription>
            {urls.length} link(s), with click statistics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UrlList urls={urls} />
        </CardContent>
      </Card>
    </main>
  );
}
