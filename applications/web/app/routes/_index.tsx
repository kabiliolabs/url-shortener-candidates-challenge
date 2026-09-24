import { RefreshCw } from "lucide-react";
import { data, useActionData, useRevalidator } from "react-router";
import type { Route } from "./+types/_index";
import { DomainError } from "@url-shortener/engine";
import { CopyButton } from "../components/copy-button";
import { ShortenForm } from "../components/shorten-form";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { UrlTable } from "../components/url-table";
import { getPublicUrl, urlShortener } from "../lib/container.server";
import { cn } from "../lib/utils";
import { createLinkLimiter, getClientIp } from "../lib/rate-limiter.server";

type ActionResult = { shortenedUrl?: string; error?: string };

export async function loader() {
  return {
    baseUrl: `${getPublicUrl()}/s/`,
    urls: await urlShortener.list(),
  };
}

export async function action({ request }: Route.ActionArgs) {
  
  const limit = createLinkLimiter.check(getClientIp(request));
  if (!limit.allowed) {
    return data<ActionResult>(
      { error: `Too many requests. Please try again in ${limit.retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }
  
  const formData = await request.formData();

  try {
    const created = await urlShortener.shorten(formData.get("url"));
    return data<ActionResult>(
      { shortenedUrl: `${getPublicUrl()}/s/${created.code}` },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof DomainError) {
      return data<ActionResult>({ error: error.message }, { status: 400 });
    }
    console.error(error);
    return data<ActionResult>(
      { error: "Something went wrong, please try again" },
      { status: 500 },
    );
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { baseUrl, urls } = loaderData;
  const actionData = useActionData<typeof action>();
  const revalidator = useRevalidator();
  const isRefreshing = revalidator.state === "loading";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">URL Shortener</h1>
          <p className="text-slate-600">Paste a long link and get a short one you can share.</p>
        </header>

        <Card>
          <CardContent className="space-y-4">
            <ShortenForm error={actionData?.error} shortenedUrl={actionData?.shortenedUrl} />
            {actionData?.shortenedUrl && (
              <div className="flex flex-col gap-3 rounded-md bg-indigo-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-indigo-700">
                    Your short link
                  </p>
                  <a
                    href={actionData.shortenedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate font-mono text-indigo-900 hover:underline"
                  >
                    {actionData.shortenedUrl}
                  </a>
                </div>
                <CopyButton text={actionData.shortenedUrl} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your links</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => revalidator.revalidate()}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <UrlTable urls={urls} baseUrl={baseUrl} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}