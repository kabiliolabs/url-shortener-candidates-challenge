import { Link } from "react-router";
import type { Route } from "./+types/urls";
import { listShortenedUrls } from "~/container.server";
import { config } from "~/infrastructure/config.server";
import { toView } from "~/presenters/shortened-url-view";
import { Card, CardBody, Stat } from "~/components/ui/card";
import { CopyButton } from "~/components/copy-button";
import { useRevalidateOnFocus } from "~/hooks/use-revalidate-on-focus";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Links & statistics · URL Shortener" }];
}

export async function loader() {
  const { urls, stats } = await listShortenedUrls.execute();
  return { stats, urls: urls.map((url) => toView(url, config.publicUrl)) };
}

export default function Urls({ loaderData }: Route.ComponentProps) {
  const { stats, urls } = loaderData;

  useRevalidateOnFocus();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:py-20">
      <header className="mb-8">
        <Link
          to="/"
          className="text-sm text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
        >
          ← Shorten a link
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
          Links &amp; statistics
        </h1>
      </header>

      <dl className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Short links" value={stats.totalUrls} />
        <Stat label="Total clicks" value={stats.totalClicks} />
        <Stat
          label="Avg. clicks / link"
          value={stats.totalUrls === 0 ? 0 : (stats.totalClicks / stats.totalUrls).toFixed(1)}
        />
      </dl>

      {urls.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No links yet.{" "}
              <Link to="/" className="underline underline-offset-4">
                Create the first one
              </Link>
              .
            </p>
          </CardBody>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {/* Only the table scrolls horizontally on small screens, never the page. */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Short link</th>
                  <th scope="col" className="px-4 py-3 font-medium">Destination</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Clicks</th>
                  <th scope="col" className="px-4 py-3 font-medium">Created</th>
                  <th scope="col" className="px-4 py-3 font-medium">Last visit</th>
                  <th scope="col" className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {urls.map((url) => (
                  <tr key={url.code} className="hover:bg-muted">
                    <td className="px-4 py-3">
                      <a
                        href={url.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-foreground underline decoration-border underline-offset-4"
                      >
                        /s/{url.code}
                      </a>
                    </td>
                    <td className="max-w-[18rem] truncate px-4 py-3 text-muted-foreground">
                      <span title={url.destination}>{url.destination}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">
                      {url.clicks}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      <FormattedDate value={url.createdAt} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {url.lastVisitedAt ? <FormattedDate value={url.lastVisitedAt} /> : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <CopyButton value={url.shortUrl} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

/**
 * Rendered from the ISO string with a fixed locale/timezone so the server HTML
 * and the client hydration always match.
 */
function FormattedDate({ value }: { value: string }) {
  const date = new Date(value);
  const formatted = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
  return <time dateTime={value}>{formatted}</time>;
}
