import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { UrlStats } from "~/lib/url-stats";

type UrlStatsTableProps = {
  urls: UrlStats[];
  baseUrl: string;
};

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoDate));
}

export function UrlStatsTable({ urls, baseUrl }: UrlStatsTableProps) {
  if (urls.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No URLs have been shortened yet.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Original URL</TableHead>
          <TableHead>Short link</TableHead>
          <TableHead className="text-right">Shortens</TableHead>
          <TableHead className="text-right">Clicks</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {urls.map((record) => {
          const shortLink = `${baseUrl}${record.shortCode}`;

          return (
            <TableRow key={record.id}>
              <TableCell className="max-w-xs truncate font-medium">
                <a
                  href={record.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  title={record.url}
                >
                  {record.url}
                </a>
              </TableCell>
              <TableCell>
                <a
                  href={shortLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-primary hover:underline"
                >
                  {record.shortCode}
                </a>
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="secondary">{record.shortenCount}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="outline">{record.clickCount}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(record.createdAt)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
