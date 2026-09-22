import { Link } from "react-router";
import type { Route } from "./+types/urls";
import { listShortUrls } from "~/.server/container";
import { shortLinkFor } from "~/.server/config";

// Formatted on the server in a fixed time zone so server and client render identical text (no hydration mismatch).
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export async function loader() {
  const shortUrls = await listShortUrls.execute();
  return {
    shortUrls: shortUrls.map((shortUrl) => ({
      shortCode: shortUrl.shortCode,
      shortLink: shortLinkFor(shortUrl.shortCode),
      originalUrl: shortUrl.originalUrl,
      clicks: shortUrl.clicks,
      createdAt: dateFormat.format(shortUrl.createdAt),
      lastClickedAt: shortUrl.lastClickedAt
        ? dateFormat.format(shortUrl.lastClickedAt)
        : null,
    })),
  };
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Stats · URL Shortener" }];
}

export default function Urls({ loaderData }: Route.ComponentProps) {
  const { shortUrls } = loaderData;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-16">
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
        Short links
      </h1>

      {shortUrls.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          No links yet.{" "}
          <Link to="/" className="text-blue-700 underline dark:text-blue-400">
            Shorten your first URL
          </Link>
          .
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-400">
              <tr>
                <th className="px-3 py-2 font-medium">Short link</th>
                <th className="px-3 py-2 font-medium">Original URL</th>
                <th className="px-3 py-2 text-right font-medium">Clicks</th>
                <th className="px-3 py-2 font-medium">Created (UTC)</th>
                <th className="px-3 py-2 font-medium">Last clicked (UTC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-900 dark:divide-gray-800 dark:text-gray-100">
              {shortUrls.map((shortUrl) => (
                <tr key={shortUrl.shortCode}>
                  <td className="px-3 py-2 font-mono whitespace-nowrap">
                    <a
                      href={shortUrl.shortLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 underline dark:text-blue-400"
                    >
                      {shortUrl.shortCode}
                    </a>
                  </td>
                  <td className="max-w-xs truncate px-3 py-2" title={shortUrl.originalUrl}>
                    {shortUrl.originalUrl}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{shortUrl.clicks}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{shortUrl.createdAt}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {shortUrl.lastClickedAt ?? (
                      <span className="text-gray-500">Never</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
