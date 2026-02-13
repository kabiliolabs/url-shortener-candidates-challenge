import { useLoaderData, Link } from "react-router";
import { StatsCard } from "~/components/StatsCard";
import { UrlCard } from "~/components/UrlCard";
import { urlService } from "~/lib/url-service.server";

export function meta() {
  return [
    { title: "Dashboard - URL Shortener" },
    { name: "description", content: "View and manage your shortened URLs" },
  ];
}

export async function loader() {
  const urls = await urlService.getAllUrls();
  const baseUrl = process.env.PUBLIC_URL || "http://localhost:5173";
  return { urls, baseUrl };
}

export default function Dashboard() {
  const { urls, baseUrl } = useLoaderData<typeof loader>();

  // Calculate stats
  const totalClicks = urls.reduce((sum, url) => sum + url.clickCount, 0);
  const avgClicksPerUrl = urls.length > 0 
    ? Math.round(totalClicks / urls.length) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">URL Dashboard</h1>
            <p className="text-gray-600 mt-1">
              View and manage your shortened URLs
            </p>
          </div>
          <Link
            to="/"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors duration-200 font-medium"
          >
            + Create New URL
          </Link>
        </div>

        {/* Empty State */}
        {urls.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">🔗</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No shortened URLs yet
            </h2>
            <p className="text-gray-500 mb-6">
              Create your first shortened URL to get started!
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors duration-200 font-medium"
            >
              Create Your First URL
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <StatsCard title="Total URLs" value={urls.length} />
              <StatsCard title="Total Clicks" value={totalClicks} />
              <StatsCard title="Avg. Clicks per URL" value={avgClicksPerUrl} />
            </div>

            {/* URLs List */}
            <div className="space-y-4">
              {urls.map((url) => (
                <UrlCard
                  key={url.id}
                  shortCode={url.shortCode}
                  originalUrl={url.originalUrl}
                  clickCount={url.clickCount}
                  createdAt={url.createdAt}
                  recentClicks={url.recentClicks}
                  baseUrl={baseUrl}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
