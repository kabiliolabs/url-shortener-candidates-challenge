import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/Stats";

import { type StatsViewData } from "@url-shortener/engine";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { StatsSummaryCards } from "~/components/layout/StatsSummaryCards";
import { StatsTopLinks } from "~/components/layout/StatsTopLinks";
import { StatsLinksTable } from "~/components/layout/StatsLinksTable";
import { loadStatsViewData } from "~/server/load-stats-data";

type StatsLoaderData = StatsViewData & { baseUrl: string };

export async function loader(): Promise<StatsLoaderData> {
  const stats = await loadStatsViewData();
  return { ...stats, baseUrl: process.env.PUBLIC_URL ?? "" };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Statistics – URL Shortener" },
    { name: "description", content: "Click statistics for all shortened links." },
  ];
}

export default function StatsPage() {
  const { totalLinks, totalClicks, topLinks, allLinks, loadError, baseUrl } =
    useLoaderData<typeof loader>();

  return (
    <main className="flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-14 sm:px-6 lg:py-20">
        <header className="mb-10 space-y-1">
          <nav className="mb-4 text-xs text-muted-foreground">
            <Link
              to="/"
              className="underline-offset-4 hover:underline hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <span className="mx-1.5">/</span>
            <span>Statistics</span>
          </nav>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Statistics
          </h1>
          <p className="text-muted-foreground">
            Click activity across all shortened links.
          </p>
        </header>

        {loadError ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Could not load statistics</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{loadError}</p>
              <p className="text-xs">
                Check that the database is running and{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.7rem]">
                  DATABASE_URL
                </code>{" "}
                is set, then refresh this page.
              </p>
            </AlertDescription>
          </Alert>
        ) : null}

        {!loadError && totalLinks === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <p className="text-sm text-muted-foreground">
              No links yet.{" "}
              <Link to="/" className="font-medium text-foreground underline-offset-4 hover:underline">
                Create your first short link
              </Link>{" "}
              to see stats here.
            </p>
          </div>
        ) : null}

        {!loadError && totalLinks > 0 ? (
          <div className="space-y-6">
            <StatsSummaryCards totalLinks={totalLinks} totalClicks={totalClicks} />
            <StatsTopLinks topLinks={topLinks} />
            <StatsLinksTable links={allLinks} baseUrl={baseUrl} />
          </div>
        ) : null}
      </div>
    </main>
  );
}
