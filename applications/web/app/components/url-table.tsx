import type { ShortUrl } from "@url-shortener/engine";
import { Badge } from "./ui/badge";

// Fixed locale and time zone so the server and browser render identical text (no hydration mismatch).
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

interface UrlTableProps {
  urls: ShortUrl[];
  baseUrl: string;
}

export function UrlTable({ urls, baseUrl }: UrlTableProps) {
  if (urls.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        No links yet. Shorten your first URL above.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-4 font-medium">Short link</th>
            <th className="py-2 pr-4 font-medium">Original URL</th>
            <th className="py-2 pr-4 text-right font-medium">Clicks</th>
            <th className="py-2 font-medium">Created (UTC)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {urls.map((url) => (
            <tr key={url.id}>
              <td className="py-3 pr-4 font-mono">
                <a
                  href={`${baseUrl}${url.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  /s/{url.code}
                </a>
              </td>
              <td className="max-w-xs py-3 pr-4">
                <span className="block truncate text-slate-600" title={url.originalUrl}>
                  {url.originalUrl}
                </span>
              </td>
              <td className="py-3 pr-4 text-right">
                <Badge>{url.clicks}</Badge>
              </td>
              <td className="whitespace-nowrap py-3 text-slate-500">
                {dateFormat.format(new Date(url.createdAt))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}