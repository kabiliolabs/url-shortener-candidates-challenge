import { List } from "lucide-react";

import type { ShortenedUrl } from "@url-shortener/engine";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

type StatsLinksTableProps = {
  links: ShortenedUrl[];
  baseUrl: string;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function StatsLinksTable({ links, baseUrl }: StatsLinksTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="size-4" aria-hidden />
          All links
        </CardTitle>
        <CardDescription>Every short link and its click total.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {links.length === 0 ? (
          <p className="px-6 py-4 text-sm text-muted-foreground">
            No links yet. Create your first short link on the home page.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                  <th className="px-6 py-2.5 text-left font-medium">Code</th>
                  <th className="px-6 py-2.5 text-left font-medium">Destination</th>
                  <th className="px-6 py-2.5 text-right font-medium">Clicks</th>
                  <th className="px-6 py-2.5 text-right font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3">
                      <a
                        href={`${baseUrl}/s/${link.code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-foreground underline-offset-4 hover:underline"
                      >
                        /{link.code}
                      </a>
                    </td>
                    <td className="max-w-xs px-6 py-3">
                      <a
                        href={link.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-xs text-muted-foreground underline-offset-4 hover:underline"
                        title={link.originalUrl}
                      >
                        {link.originalUrl}
                      </a>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Badge variant={link.clicks > 0 ? "secondary" : "outline"} className="tabular-nums">
                        {link.clicks.toLocaleString()}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right text-xs text-muted-foreground">
                      {formatDate(link.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
