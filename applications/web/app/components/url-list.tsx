import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { UrlStats } from "~/lib/api-client";

export type UrlListState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; urls: UrlStats[] };

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

export function UrlList({ state }: { state: UrlListState }) {
  if (state.status === "loading") {
    return (
      <p role="status" className="py-6 text-center text-sm text-muted-foreground">
        Loading links…
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <Alert variant="destructive">
        <AlertTitle>Couldn't load the links</AlertTitle>
        <AlertDescription>{state.message}</AlertDescription>
      </Alert>
    );
  }

  if (state.urls.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No links yet. Shorten your first URL above.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Original URL</TableHead>
          <TableHead>Short URL</TableHead>
          <TableHead className="text-right">Clicks</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {state.urls.map((url) => (
          <TableRow key={url.code}>
            <TableCell>
              <span title={url.originalUrl} className="block max-w-40 truncate sm:max-w-56">
                {url.originalUrl}
              </span>
            </TableCell>
            <TableCell>
              <a
                href={url.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm font-mono underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {url.shortUrl.replace(/^https?:\/\//, "")}
              </a>
            </TableCell>
            <TableCell className="text-right tabular-nums">{url.clicks}</TableCell>
            <TableCell>
              <time dateTime={url.createdAt}>{dateFormat.format(new Date(url.createdAt))}</time>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
