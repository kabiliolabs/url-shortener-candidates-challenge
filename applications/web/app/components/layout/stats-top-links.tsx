import { Trophy } from "lucide-react";

import type { ShortenedUrl } from "~/domain/models/shortened-url";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

type StatsTopLinksProps = {
  topLinks: ShortenedUrl[];
};

const rankBadgeVariant: Record<number, "default" | "secondary" | "outline"> = {
  0: "default",
  1: "secondary",
  2: "outline",
};

export function StatsTopLinks({ topLinks }: StatsTopLinksProps) {
  if (topLinks.length === 0 || topLinks.every((l) => l.clicks === 0)) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="size-4" aria-hidden />
          Top clicked links
        </CardTitle>
        <CardDescription>
          The links that have received the most traffic.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="divide-y">
          {topLinks.map((link, i) => (
            <li key={link.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <Badge
                variant={rankBadgeVariant[i] ?? "outline"}
                className="shrink-0 font-mono tabular-nums"
              >
                #{i + 1}
              </Badge>
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-sm font-medium">
                  /{link.code}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {link.originalUrl}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold tabular-nums">
                  {link.clicks.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {link.clicks === 1 ? "click" : "clicks"}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
