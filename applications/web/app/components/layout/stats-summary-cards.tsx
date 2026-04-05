import { Link2, MousePointerClick } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

type StatsSummaryCardsProps = {
  totalLinks: number;
  totalClicks: number;
};

export function StatsSummaryCards({
  totalLinks,
  totalClicks,
}: StatsSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Link2 className="size-4" aria-hidden />
            Total links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tracking-tight">{totalLinks}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {totalLinks === 1 ? "short link created" : "short links created"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MousePointerClick className="size-4" aria-hidden />
            Total clicks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tracking-tight">{totalClicks}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {totalClicks === 1 ? "redirect recorded" : "redirects recorded"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
