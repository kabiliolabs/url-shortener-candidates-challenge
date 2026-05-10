import { Link } from "react-router";
import type { Route } from "./+types/stats.$code";
import { resolveShortCode, getUrlClicksByDay } from "~/server/services/url.service.server";
import { urlRepository, clickRepository } from "~/server/repositories/index.server";
import { formatDate } from "~/services/url.helpers";
import { Card, Badge } from "~/components/ui";
import { ClicksLineChart } from "~/components/ClicksLineChart";

export async function loader({ params }: Route.LoaderArgs) {
  const code = params.code;
  const url = await resolveShortCode(code, urlRepository);

  if (!url) {
    throw new Response("Not Found", { status: 404 });
  }

  const clickCount = await clickRepository.getClickCountByUrlId(url.id);
  const dailyClicks = await getUrlClicksByDay(url.id, clickRepository, 30);

  return {
    url: {
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      createdAt: url.createdAt,
    },
    clickCount,
    dailyClicks,
  };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) {
    return [{ title: "Not Found — URL Shortener" }];
  }
  return [{ title: `Stats for /${data.url.shortCode} — URL Shortener` }];
}

export default function StatsPage({ loaderData }: Route.ComponentProps) {
  const { url, clickCount, dailyClicks } = loaderData;

  return (
    <main className="min-h-screen bg-base-200 flex items-start justify-center p-4 pt-12">
      <div className="w-full max-w-3xl space-y-6">
        <div className="flex items-center gap-2">
          <Link to="/" className="link link-primary text-sm">
            ← Back to Home
          </Link>
        </div>

        <Card title={`Stats for /${url.shortCode}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title text-sm">Total Clicks</div>
              <div className="stat-value text-2xl">
                <Badge variant="info" className="text-lg px-4 py-2">
                  {clickCount}
                </Badge>
              </div>
            </div>
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title text-sm">Original URL</div>
              <div className="stat-desc">
                <a
                  href={url.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-hover break-all text-sm"
                >
                  {url.originalUrl}
                </a>
              </div>
            </div>
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title text-sm">Created</div>
              <div className="stat-desc text-sm">{formatDate(url.createdAt)}</div>
            </div>
          </div>
        </Card>

        <Card title="Clicks Over Time (Last 30 Days)">
          <div aria-hidden="true">
            <ClicksLineChart data={dailyClicks} />
          </div>
          <p className="sr-only">
            Click data for the last 30 days:{" "}
            {dailyClicks
              .map((d) => `${d.date}: ${d.count} clicks`)
              .join(", ")}
          </p>
        </Card>
      </div>
    </main>
  );
}
