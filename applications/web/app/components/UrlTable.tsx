import { Link } from "react-router";
import { Badge } from "~/components/ui";
import { Sparkline } from "~/components/Sparkline";
import { truncateUrl, formatDate } from "~/services/url.helpers";

interface UrlTableEntry {
  id: number;
  shortCode: string;
  originalUrl: string;
  clickCount: number;
  createdAt: Date | string;
  sparklineData: number[];
}

interface UrlTableProps {
  urls: UrlTableEntry[];
  baseUrl: string;
}

export function UrlTable({ urls, baseUrl }: UrlTableProps) {
  if (urls.length === 0) {
    return (
      <p className="text-center text-base-content/60 py-8">
        No URLs shortened yet. Try shortening one above!
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th scope="col">Short Code</th>
            <th scope="col">Original URL</th>
            <th scope="col">Clicks</th>
            <th scope="col">Trend</th>
            <th scope="col">Created</th>
            <th scope="col"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {urls.map((entry) => (
            <tr key={entry.id}>
              <td className="font-mono">
                <a
                  href={`${baseUrl}${entry.shortCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-hover"
                >
                  /{entry.shortCode}
                </a>
              </td>
              <td title={entry.originalUrl} className="max-w-[200px] truncate">
                {truncateUrl(entry.originalUrl)}
              </td>
              <td>
                <Badge variant="info">{entry.clickCount}</Badge>
              </td>
              <td>
                <Sparkline data={entry.sparklineData} />
              </td>
              <td className="text-sm text-base-content/70">
                {formatDate(entry.createdAt)}
              </td>
              <td>
                <Link
                  to={`/stats/${entry.shortCode}`}
                  className="link link-primary text-sm"
                >
                  View Stats<span className="sr-only"> for /{entry.shortCode}</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
