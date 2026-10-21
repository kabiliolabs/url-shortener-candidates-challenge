import { data, Form, Link, useNavigation } from "react-router";
import type { Route } from "./+types/_index";
import { DomainError } from "@url-shortener/engine";
import { listShortenedUrls, shortenUrl } from "~/container.server";
import { config } from "~/infrastructure/config.server";
import { checkRateLimit } from "~/infrastructure/rate-limit.server";
import { toView } from "~/presenters/shortened-url-view";
import { Alert } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardBody } from "~/components/ui/card";
import { CopyButton } from "~/components/copy-button";
import { Input } from "~/components/ui/input";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

export async function loader() {
  const { urls, stats } = await listShortenedUrls.execute(RECENT_LIMIT);
  return {
    baseUrl: config.publicUrl,
    stats,
    recent: urls.map((url) => toView(url, config.publicUrl)),
  };
}

const RECENT_LIMIT = 3;

export async function action({ request }: Route.ActionArgs) {
  // Abuse prevention before any work is done.
  const rateLimit = checkRateLimit(request);
  if (!rateLimit.allowed) {
    return data(
      { error: "Too many links created. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const formData = await request.formData();
  const submitted = formData.get("url");
  const previousValue = typeof submitted === "string" ? submitted : "";

  try {
    const shortened = await shortenUrl.execute(submitted);
    return { shortUrl: shortened.shortUrl(config.publicUrl), destination: shortened.destination.value };
  } catch (error) {
    // Expected, user-fixable failures carry a real HTTP status and a message
    // the user can act on. Unexpected ones are logged and never leaked.
    if (error instanceof DomainError) {
      return data({ error: error.message, previousValue }, { status: 400 });
    }
    console.error("[shorten-url] unexpected failure", error);
    return data(
      { error: "Something went wrong on our side. Please try again.", previousValue },
      { status: 500 },
    );
  }
}

export default function Index({ loaderData, actionData }: Route.ComponentProps) {
  const { baseUrl, stats, recent } = loaderData;
  const navigation = useNavigation();

  // Loading state: true while the action is in flight (and during the
  // revalidation that follows), so the UI never looks idle after a submit.
  const isSubmitting = navigation.state !== "idle" && navigation.formMethod === "POST";

  const error = actionData && "error" in actionData ? actionData.error : null;
  const result = actionData && "shortUrl" in actionData ? actionData : null;

  // Keep what the user typed when validation fails, so they can fix it instead
  // of retyping the whole URL.
  const previousValue =
    actionData && "previousValue" in actionData && typeof actionData.previousValue === "string"
      ? actionData.previousValue
      : "";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:py-24">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          Shorten a link
        </h1>
        <p className="mt-2.5 text-zinc-600 dark:text-zinc-400">
          Paste a long URL and get a short one you can share. Every visit is counted.
        </p>
      </header>

      <Card>
        <CardBody>
          <Form method="post" className="space-y-4" key={result?.shortUrl ?? "form"}>
            <div className="space-y-2">
              <label
                htmlFor="url"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Destination URL
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  id="url"
                  name="url"
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  placeholder="https://example.com/a-very-long-link"
                  defaultValue={previousValue}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "url-error" : "url-hint"}
                  disabled={isSubmitting}
                  className="sm:flex-1"
                />
                <Button type="submit" disabled={isSubmitting} className="sm:w-36">
                  {isSubmitting ? <Spinner label="Shortening" /> : "Shorten"}
                </Button>
              </div>
              <p id="url-hint" className="text-xs text-zinc-500 dark:text-zinc-400">
                Your link will look like{" "}
                <span className="font-mono text-zinc-600 dark:text-zinc-300">{baseUrl}/s/xxxxxxx</span>
              </p>
            </div>

            {error && (
              <Alert>
                <span id="url-error">{error}</span>
              </Alert>
            )}
          </Form>

          {result && (
            <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Your short link
              </p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <a
                  href={result.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all font-mono text-sm text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-700 dark:hover:decoration-zinc-100"
                >
                  {result.shortUrl}
                </a>
                <CopyButton value={result.shortUrl} />
              </div>
              <p className="mt-2 truncate text-xs text-zinc-500 dark:text-zinc-400">
                → {result.destination}
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      <section className="mt-10">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Recent links
          </h2>
          <Link
            to="/urls"
            className="text-sm text-zinc-500 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            All links &amp; stats ({stats.totalUrls})
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No links yet. Shorten one above.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {recent.map((url) => (
              <li
                key={url.code}
                className="flex items-center justify-between gap-4 bg-white px-4 py-3 dark:bg-zinc-900/60"
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm text-zinc-900 dark:text-zinc-100">/s/{url.code}</p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{url.destination}</p>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                  {url.clicks} {url.clicks === 1 ? "click" : "clicks"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Spinner({ label }: { label: string }) {
  return (
    <>
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      />
      <span>{label}…</span>
    </>
  );
}
