import { Link } from "react-router";
import type { Route } from "./+types/stats";
import { baseUrl, listUrlsUseCase } from "@url-shortener/engine";
import { DeleteUrlButton } from "~/components/delete-url-button";
import { formatDate, formatNumber } from "~/lib/format";
import { deleteUrlFromForm } from "~/lib/url-actions.server";

export async function loader() {
  const urls = await listUrlsUseCase.execute();

  return {
    baseUrl: baseUrl ?? "",
    urls: urls.map((url) => ({
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      clickCount: url.clickCount,
      createdAt: url.createdAt.toISOString(),
    })),
  };
}

export async function action({ request }: Route.ActionArgs) {
  return deleteUrlFromForm(request);
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Statistics | URL Shortener" },
    {
      name: "description",
      content: "Click statistics for your shortened URLs",
    },
  ];
}

export default function Stats({ loaderData }: Route.ComponentProps) {
  const { baseUrl, urls } = loaderData;
  const totalClicks = urls.reduce((sum, url) => sum + url.clickCount, 0);

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          to="/"
          className="text-sm font-medium text-moss transition hover:text-forest focus:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-cream dark:text-sage dark:hover:text-cream dark:focus-visible:ring-sage dark:focus-visible:ring-offset-forest"
        >
          ← Back to shortener
        </Link>

        <header className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-forest dark:text-cream">
              Statistics
            </h1>
            <p className="mt-1 text-sm text-moss dark:text-sage">
              Every active short link and how many times it has been visited.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-cream transition hover:bg-moss focus:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-cream dark:bg-cream dark:text-forest dark:hover:bg-sage dark:focus-visible:ring-sage dark:focus-visible:ring-offset-forest"
          >
            New short link
          </Link>
        </header>

        <section
          className="mt-8 grid gap-4 sm:grid-cols-2"
          aria-label="Summary"
        >
          <SummaryCard label="Active links" value={urls.length} />
          <SummaryCard label="Total clicks" value={totalClicks} />
        </section>

        {urls.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-sage bg-cream/60 px-8 py-14 text-center dark:border-sage/30 dark:bg-cream/5">
            <h2 className="text-lg font-semibold text-forest dark:text-cream">
              No links yet
            </h2>
            <p className="mt-2 text-sm text-moss dark:text-sage">
              Shorten your first URL to start collecting click statistics.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-cream transition hover:bg-moss focus:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-cream dark:bg-cream dark:text-forest dark:hover:bg-sage dark:focus-visible:ring-sage dark:focus-visible:ring-offset-forest"
            >
              Create a short link
            </Link>
          </div>
        ) : (
          <ul className="mt-8 divide-y divide-sage/50 overflow-hidden rounded-2xl border border-sage/60 bg-cream dark:divide-sage/20 dark:border-sage/25 dark:bg-cream/5">
            {urls.map((url) => (
              <li
                key={url.shortCode}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <a
                    href={`${baseUrl}/s/${url.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm font-semibold break-all text-moss transition hover:text-forest hover:underline dark:text-sage dark:hover:text-cream"
                  >
                    {baseUrl}/s/{url.shortCode}
                  </a>
                  <p
                    className="mt-1 truncate text-sm text-moss dark:text-sage"
                    title={url.originalUrl}
                  >
                    {url.originalUrl}
                  </p>
                  <p className="mt-1 text-xs tracking-wide text-moss uppercase dark:text-sage">
                    Created{" "}
                    <time dateTime={url.createdAt}>
                      {formatDate(url.createdAt)}
                    </time>
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="flex items-baseline gap-2 sm:flex-col sm:items-end">
                    <span className="text-2xl font-semibold tabular-nums text-forest dark:text-cream">
                      {formatNumber(url.clickCount)}
                    </span>
                    <span className="text-xs font-medium tracking-wide text-moss uppercase dark:text-sage">
                      {url.clickCount === 1 ? "click" : "clicks"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <Link
                      to={`/stats/${url.shortCode}`}
                      className="text-sm font-medium text-moss underline decoration-sage underline-offset-4 transition hover:text-forest dark:text-sage dark:hover:text-cream"
                    >
                      Details
                    </Link>
                    <DeleteUrlButton shortCode={url.shortCode} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-sage/60 bg-cream p-6 dark:border-sage/25 dark:bg-cream/5">
      <p className="text-xs font-semibold tracking-widest text-moss uppercase dark:text-sage">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-forest dark:text-cream">
        {formatNumber(value)}
      </p>
    </div>
  );
}
