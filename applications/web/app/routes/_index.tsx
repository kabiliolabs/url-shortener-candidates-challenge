import { Form, useActionData, useLoaderData, useNavigation, useFetcher } from "react-router";
import type { Route } from "./+types/_index";
import {
  ShortenUrlUseCase,
  ListUrlsUseCase,
  UrlRequiredError,
  InvalidUrlError,
  RateLimitExceededError,
} from "@url-shortener/engine";
import { shortenRateLimiter } from "../infrastructure/shorten-rate-limiter";
import { PrismaUrlRepository } from "../infrastructure/prisma-url-repository";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export async function loader() {
  const repository = new PrismaUrlRepository();
  const listUrls = new ListUrlsUseCase(repository);
  const urls = await listUrls.execute();

  return {
    baseUrl: process.env.PUBLIC_URL ?? "",
    urls: urls.map((u) => ({
      id: u.id,
      shortCode: u.shortCode.value,
      originalUrl: u.originalUrl.value,
      clicks: u.clicks,
      createdAt: u.createdAt.toISOString(),
    })),
  };
}

function toErrorMessage(err: unknown): string {
  if (err instanceof RateLimitExceededError) return "Too many requests. Please try again later.";
  if (err instanceof UrlRequiredError) return "Please enter a URL";
  if (err instanceof InvalidUrlError) return "Please enter a valid URL";
  return "Something went wrong";
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  let rawUrl = formData.get("url") as string;
  if (rawUrl && !/^https?:\/\//i.test(rawUrl)) {
    rawUrl = `https://${rawUrl}`;
  }

  const clientId =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  try {
    const repository = new PrismaUrlRepository();
    const shortenUrl = new ShortenUrlUseCase(repository, shortenRateLimiter);
    const shortened = await shortenUrl.execute(rawUrl, clientId);

    return {
      shortCode: shortened.shortCode.value,
      error: null,
    };
  } catch (err) {
    return { shortCode: null, error: toErrorMessage(err) };
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

function UrlRow({ url, baseUrl }: { url: { id: string; shortCode: string; originalUrl: string; clicks: number }; baseUrl: string }) {
  const fetcher = useFetcher();
  const optimisticClicks = fetcher.state !== "idle" ? url.clicks + 1 : url.clicks;

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    window.open(url.originalUrl, "_blank", "noopener,noreferrer");
    fetcher.submit(null, { method: "post", action: `/api/track/${url.shortCode}` });
  }

  return (
    <li className="flex items-center justify-between px-6 py-3 gap-4">
      <div className="min-w-0 flex-1 space-y-0.5">
        <a
          href={url.originalUrl}
          onClick={handleClick}
          className="text-sm font-mono text-primary hover:underline cursor-pointer"
        >
          /{url.shortCode}
        </a>
        <p className="text-xs text-muted-foreground truncate">{url.originalUrl}</p>
      </div>
      <Badge variant="secondary" className="shrink-0">
        {optimisticClicks} {optimisticClicks === 1 ? "click" : "clicks"}
      </Badge>
    </li>
  );
}

export default function Index() {
  const { baseUrl, urls } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const shortenedUrl = actionData?.shortCode
    ? `${baseUrl}/s/${actionData.shortCode}`
    : null;

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">URL Shortener</h1>
          <p className="text-muted-foreground">
            Paste a long URL and get a short one instantly
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Form method="post" className="flex gap-2">
              <Input
                type="text"
                name="url"
                placeholder="https://example.com/very/long/url"
                required
                className={`flex-1 ${actionData?.error ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Shortening…" : "Shorten"}
              </Button>
            </Form>

            {shortenedUrl && (
              <div className="mt-4 p-3 bg-muted rounded-md flex items-center justify-between gap-2">
                <a
                  href={shortenedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-primary hover:underline truncate"
                >
                  {shortenedUrl}
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(shortenedUrl)}
                >
                  Copy
                </Button>
              </div>
            )}

            {actionData?.error && (
              <p className="mt-3 text-sm text-destructive">{actionData.error}</p>
            )}
          </CardContent>
        </Card>

        {urls.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent URLs</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y max-h-80 overflow-y-auto">
                {urls.map((url) => (
                  <UrlRow key={url.id} url={url} baseUrl={baseUrl} />
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
