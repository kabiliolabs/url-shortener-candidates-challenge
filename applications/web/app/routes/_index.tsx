import { useActionData } from "react-router";
import type { Route } from "./+types/_index";
import {
  baseUrl,
  checkShortenRateLimit,
  clientKey,
  ownHostname,
  parseShortenRequest,
  readFormFields,
  shortenerApp,
  toErrorResponse,
} from "@url-shortener/engine";

import { ResultCard } from "~/components/result-card";
import { ShortenForm } from "~/components/shorten-form";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { UrlList } from "~/components/url-list";
import { describeError, NETWORK_ERROR, type ApiError } from "~/lib/api-client";
import { useUrlList } from "~/lib/use-url-list";

type ShortenOutcome = { shortenedUrl: string } | { error: ApiError };

export function loader() {
  return {
    shortUrlPrefix: baseUrl ? `${baseUrl}/s/` : "-",
    ownHostname,
  };
}

export async function action({ request }: Route.ActionArgs) {
  try {
    checkShortenRateLimit(clientKey(request));
    const { url } = parseShortenRequest(await readFormFields(request));
    const shortUrl = await shortenerApp.shortenUrl.execute(url);
    return { shortenedUrl: `${baseUrl}/s/${shortUrl.code}` };
  } catch (error) {
    return toErrorResponse(error);
  }
}

// The server action already maps every failure to a structured error, so a throw here means the request never completed.
export async function clientAction({ serverAction }: Route.ClientActionArgs) {
  try {
    return await serverAction();
  } catch (error) {
    if (error instanceof TypeError) {
      return { error: NETWORK_ERROR };
    }
    throw error;
  }
}

// The loader only returns static config, so skip the post-action refetch (which would also hit the ErrorBoundary when offline).
export function shouldRevalidate() {
  return false;
}

// React Router drops headers from action Responses unless forwarded here; only Retry-After matters to clients.
export function headers({ actionHeaders }: Route.HeadersArgs) {
  const retryAfter = actionHeaders.get("Retry-After");
  return retryAfter ? { "Retry-After": retryAfter } : {};
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { shortUrlPrefix, ownHostname } = loaderData;
  const actionData = useActionData() as ShortenOutcome | undefined;
  const shortenedUrl =
    actionData && "shortenedUrl" in actionData ? actionData.shortenedUrl : undefined;
  const requestError =
    actionData && "error" in actionData ? describeError(actionData.error) : undefined;
  const urlList = useUrlList(shortenedUrl);

  return (
    <main className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="grid gap-1">
          <h1 className="text-3xl font-semibold tracking-tight">URL Shortener</h1>
          <p className="text-muted-foreground">
            Paste a long link and get a short one that's easy to share.
          </p>
        </header>

        <Card>
          <CardContent>
            <ShortenForm ownHostname={ownHostname} shortUrlPrefix={shortUrlPrefix} />
          </CardContent>
        </Card>

        {requestError && (
          <Alert variant="destructive">
            <AlertTitle>Couldn't shorten that URL</AlertTitle>
            <AlertDescription>{requestError}</AlertDescription>
          </Alert>
        )}

        <div aria-live="polite">
          {shortenedUrl && <ResultCard key={shortenedUrl} shortUrl={shortenedUrl} />}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent links</CardTitle>
            <CardDescription>Newest first, with how many times each was opened.</CardDescription>
          </CardHeader>
          <CardContent>
            <UrlList state={urlList} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
