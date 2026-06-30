import { Link } from "react-router";
import type { Route } from "./+types/links";
import { baseUrl } from "../.server/config";
import { findAllShortUrls } from "../.server/short-url";
import { SiteHeader } from "../components/site-header";
import { Card } from "../components/card";
import { buttonClassName } from "../components/button";
import { CopyButton } from "../components/copy-button";
import { cn } from "../lib/cn";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export async function loader() {
  const links = await findAllShortUrls();

  return {
    shortBaseUrl: `${baseUrl}/s/`,
    links: links.map((link) => ({
      id: link.id,
      code: link.code,
      originalUrl: link.originalUrl,
      clicks: link.clicks,
      createdAt: dateFormatter.format(link.createdAt),
    })),
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Your links · URL Shortener" },
    { name: "description", content: "Every short link you've created" },
  ];
}

const ROW_COLUMNS =
  "gap-x-6 gap-y-1 sm:grid-cols-[8rem_minmax(0,1fr)_5rem_8rem_auto] sm:items-center";

export default function Links({ loaderData }: Route.ComponentProps) {
  const { shortBaseUrl, links } = loaderData;
  const count = links.length;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
              Your links
            </h1>
            <p className="mt-1 text-slate-600">
              {count === 0
                ? "No links yet"
                : `${count} ${count === 1 ? "link" : "links"} created`}
            </p>
          </div>
          <Link to="/" className={buttonClassName("primary")}>
            Shorten a link
          </Link>
        </div>

        {count === 0 ? (
          <EmptyState />
        ) : (
          <Card className="mt-8 overflow-hidden">
            <div
              className={cn(
                "hidden sm:grid",
                ROW_COLUMNS,
                "border-b border-slate-200 px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-500",
              )}
            >
              <span>Code</span>
              <span>Destination</span>
              <span>Clicks</span>
              <span>Created</span>
              <span className="sr-only">Actions</span>
            </div>

            <ul className="divide-y divide-slate-100">
              {links.map((link) => (
                <li key={link.id}>
                  <div
                    className={cn(
                      "grid grid-cols-1",
                      ROW_COLUMNS,
                      "px-5 py-4",
                    )}
                  >
                    <a
                      href={`${shortBaseUrl}${link.code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm font-semibold text-brand-700 hover:underline"
                    >
                      {link.code}
                    </a>
                    <a
                      href={link.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={link.originalUrl}
                      className="min-w-0 truncate text-sm text-slate-600 hover:text-slate-900 hover:underline"
                    >
                      {link.originalUrl}
                    </a>
                    <span className="text-sm text-slate-700">
                      <span className="text-slate-400 sm:hidden">Clicks: </span>
                      {link.clicks}
                    </span>
                    <span className="text-sm text-slate-500">
                      <span className="text-slate-400 sm:hidden">Created: </span>
                      {link.createdAt}
                    </span>
                    <CopyButton
                      value={`${shortBaseUrl}${link.code}`}
                      size="sm"
                      className="justify-self-start sm:justify-self-end"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="mt-8 p-12 text-center">
      <h2 className="font-display text-xl font-semibold text-slate-900">
        No links yet
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-slate-600">
        Shorten your first link and it'll show up here with its click count.
      </p>
      <Link to="/" className={buttonClassName("primary", "mt-6")}>
        Shorten a link
      </Link>
    </Card>
  );
}
