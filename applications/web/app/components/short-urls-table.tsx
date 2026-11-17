import { useSyncExternalStore } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export type ShortUrlRow = {
  code: string;
  shortUrl: string;
  originalUrl: string;
  clicks: number;
  createdAt: Date;
};

export function ShortUrlsTable({ shortUrls }: { shortUrls: ShortUrlRow[] }) {
  if (shortUrls.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No links yet. Shorten your first one above.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Short link</TableHead>
          <TableHead>Original URL</TableHead>
          <TableHead className="text-right">Clicks</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shortUrls.map((shortUrl) => (
          <TableRow key={shortUrl.code}>
            <TableCell>
              <a
                href={shortUrl.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono underline-offset-4 hover:underline"
              >
                {shortUrl.code}
              </a>
            </TableCell>
            <TableCell className="max-w-48 truncate sm:max-w-xs">
              <span title={shortUrl.originalUrl}>{shortUrl.originalUrl}</span>
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {shortUrl.clicks}
            </TableCell>
            <TableCell className="text-muted-foreground">
              <CreatedDate date={shortUrl.createdAt} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// The server cannot know the viewer's time zone or locale. The first render,
// on the server and during hydration, shows the same UTC text so the markup
// matches; once mounted, it switches to the viewer's own zone and locale.
function CreatedDate({ date }: { date: Date }) {
  const hydrated = useHydrated();

  return (
    <time dateTime={date.toISOString()}>
      {hydrated ? formatLocal(date) : formatUtc(date)}
    </time>
  );
}

const noSubscription = () => () => {};

// False on the server and during hydration, true afterwards, without the extra
// effect and state that a "mounted" flag would need.
function useHydrated(): boolean {
  return useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
}

// Built by hand instead of with Intl: Node and the browser can ship different
// locale data, and any difference in the text would be a hydration mismatch.
function formatUtc(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  const day = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
  const time = `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
  return `${day} ${time} UTC`;
}

function formatLocal(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
