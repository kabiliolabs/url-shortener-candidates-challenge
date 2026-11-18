import { data, Link } from "react-router";
import type { Route } from "./+types/stats.$code";
import {
  baseUrl,
  getUrlStatsUseCase,
  UrlNotFoundError,
} from "@url-shortener/engine";
import { DeleteUrlButton } from "~/components/delete-url-button";
import { ErrorPage } from "~/components/error-page";
import { formatDate, formatNumber } from "~/lib/format";
import { deleteUrlFromForm } from "~/lib/url-actions.server";

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const url = await getUrlStatsUseCase.execute(params.code);

    return {
      found: true as const,
      baseUrl: baseUrl ?? "",
      url: {
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        clickCount: url.clickCount,
        createdAt: url.createdAt.toISOString(),
      },
    };
  } catch (error) {
    if (error instanceof UrlNotFoundError) {
      return data({ found: false as const }, { status: 404 });
    }

    throw error;
  }
}

export async function action({ request }: Route.ActionArgs) {
  return deleteUrlFromForm(request);
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Link details | URL Shortener" },
    {
      name: "description",
      content: "Click statistics for a shortened URL",
    },
  ];
}

export default function UrlStatsDetail({ loaderData }: Route.ComponentProps) {
  if (!loaderData.found) {
    return (
      <ErrorPage
        status={404}
        title="Short link not found"
        message="This short link doesn't exist or has been deleted."
      />
    );
  }

  const { baseUrl, url } = loaderData;
  const shortUrl = `${baseUrl}/s/${url.shortCode}`;

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          to="/stats"
          className="text-sm font-medium text-moss transition hover:text-forest focus:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-cream dark:text-sage dark:hover:text-cream dark:focus-visible:ring-sage dark:focus-visible:ring-offset-forest"
        >
          ← Back to statistics
        </Link>

        <div className="mt-6 overflow-hidden rounded-2xl border border-sage/60 bg-cream dark:border-sage/25 dark:bg-cream/5">
          <div className="flex flex-col gap-4 border-b border-sage/50 p-6 sm:flex-row sm:items-start sm:justify-between dark:border-sage/20">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-widest text-moss uppercase dark:text-sage">
                Short link
              </p>
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block font-mono text-lg font-semibold break-all text-forest underline decoration-sage decoration-2 underline-offset-4 transition hover:text-moss dark:text-cream dark:hover:text-sage"
              >
                {shortUrl}
              </a>
            </div>

            <DeleteUrlButton shortCode={url.shortCode} />
          </div>

          <dl className="grid gap-6 p-6 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold tracking-widest text-moss uppercase dark:text-sage">
                Clicks
              </dt>
              <dd className="mt-2 text-3xl font-semibold tabular-nums text-forest dark:text-cream">
                {formatNumber(url.clickCount)}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold tracking-widest text-moss uppercase dark:text-sage">
                Created
              </dt>
              <dd className="mt-2 text-sm text-forest/90 dark:text-cream/90">
                <time dateTime={url.createdAt}>
                  {formatDate(url.createdAt)}
                </time>
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold tracking-widest text-moss uppercase dark:text-sage">
                Status
              </dt>
              <dd className="mt-2 inline-flex items-center gap-2 rounded-full bg-sage/25 px-3 py-1 text-sm font-medium text-forest dark:bg-sage/15 dark:text-cream">
                <span
                  className="size-2 rounded-full bg-moss dark:bg-sage"
                  aria-hidden="true"
                />
                Active
              </dd>
            </div>
          </dl>

          <div className="border-t border-sage/50 p-6 dark:border-sage/20">
            <p className="text-xs font-semibold tracking-widest text-moss uppercase dark:text-sage">
              Original URL
            </p>
            <p className="mt-2">
              <a
                href={url.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm break-all text-moss underline decoration-sage underline-offset-4 transition hover:text-forest dark:text-sage dark:hover:text-cream"
              >
                {url.originalUrl}
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
