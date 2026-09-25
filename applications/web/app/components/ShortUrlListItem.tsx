import type { ShortUrl } from "@url-shortener/engine";
import { formatRelativeTime } from "~/lib/format-relative-time";

interface ShortUrlListItemProps {
  shortUrl: ShortUrl;
  baseUrl: string;
}

export function ShortUrlListItem({ shortUrl, baseUrl }: ShortUrlListItemProps) {
  const shortLink = `${baseUrl}/s/${shortUrl.code}`;

  const statsLine =
    shortUrl.clickCount === 0 || !shortUrl.lastClickedAt
      ? "Not clicked yet."
      : shortUrl.clickCount === 1
        ? `Clicked once, ${formatRelativeTime(shortUrl.lastClickedAt)}.`
        : `Clicked ${shortUrl.clickCount} times, most recently ${formatRelativeTime(shortUrl.lastClickedAt)}.`;

  return (
    <li className="border-b border-dashed border-border py-4 last:border-b-0">
      <a
        href={shortLink}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-sm font-medium text-foreground hover:text-primary"
      >
        {shortLink}
      </a>
      <p className="mt-1 truncate font-mono text-sm text-muted-foreground">
        {shortUrl.originalUrl}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{statsLine}</p>
    </li>
  );
}
