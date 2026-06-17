import { useRevalidator } from "react-router";
import type { Route } from "./+types/urls";
import { baseUrl } from "@url-shortener/engine";
import { getAllUrls } from "@url-shortener/database";
import { UrlStatsTable } from "~/components/url-stats-table";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export async function loader() {
  const urls = await getAllUrls();

  return {
    shortLinkBase: baseUrl ? `${baseUrl}/s/` : "/s/",
    urls: urls.map((record) => ({
      id: record.id,
      url: record.url,
      shortCode: record.shortCode,
      shortenCount: record.shortenCount,
      clickCount: record.clickCount,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    })),
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "URL Statistics" },
    {
      name: "description",
      content: "View all shortened URLs and their statistics",
    },
  ];
}

export default function StatsPage({ loaderData }: Route.ComponentProps) {
  const { shortLinkBase, urls } = loaderData;
  const revalidator = useRevalidator();
  const isRefreshing = revalidator.state === "loading";

  const totalClicks = urls.reduce((sum, record) => sum + record.clickCount, 0);
  const totalShortens = urls.reduce(
    (sum, record) => sum + record.shortenCount,
    0,
  );

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Statistics</h1>
        <p className="text-sm text-muted-foreground">
          All shortened URLs and their usage metrics.
        </p>
        <Button
          type="button"
          variant="outline"
          disabled={isRefreshing}
          onClick={() => {
            revalidator.revalidate();
          }}
        >
          {isRefreshing ? "Loading…" : "Refresh"}
        </Button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total URLs</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{urls.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total shortens</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{totalShortens}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total clicks</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{totalClicks}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All URLs</CardTitle>
          <CardDescription>
            Click counts and shorten counts for every stored link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isRefreshing ? (
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Refreshing statistics…
            </p>
          ) : null}
          <UrlStatsTable urls={urls} baseUrl={shortLinkBase} />
        </CardContent>
      </Card>
    </main>
  );
}