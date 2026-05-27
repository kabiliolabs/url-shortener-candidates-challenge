import { Button } from "./ui/button";

export interface UrlListItem {
  clickCount: number;
  code: string;
  createdAt: string;
  originalUrl: string;
  shortenedUrl: string;
}

interface UrlListProps {
  shortUrls: UrlListItem[];
}

const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function UrlList({ shortUrls }: UrlListProps) {
  if (shortUrls.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-8 text-center text-sm text-zinc-500">
        No short URLs yet.
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-950">Recent URLs</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium" scope="col">
                Original
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                Short URL
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                Clicks
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                Created
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {shortUrls.map((shortUrl) => (
              <tr className="align-top" key={shortUrl.code}>
                <td className="max-w-xs px-4 py-3">
                  <a
                    className="line-clamp-2 break-all text-zinc-700 underline-offset-4 hover:text-zinc-950 hover:underline"
                    href={shortUrl.originalUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {shortUrl.originalUrl}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <a
                    className="break-all font-mono text-zinc-950 underline-offset-4 hover:underline"
                    href={shortUrl.shortenedUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {shortUrl.shortenedUrl}
                  </a>
                </td>
                <td className="px-4 py-3 text-zinc-700">
                  {shortUrl.clickCount}
                </td>
                <td className="px-4 py-3 text-zinc-700">
                  {dateFormatter.format(new Date(shortUrl.createdAt))}
                </td>
                <td className="px-4 py-3">
                  <Button asChild size="sm" variant="ghost">
                    <a
                      href={shortUrl.shortenedUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Open
                    </a>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
