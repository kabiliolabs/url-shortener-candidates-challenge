import { useLoaderData, Link } from "react-router";
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

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">URL Dashboard</h1>
            <p className="text-gray-600 mt-1">View and manage your shortened URLs</p>
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
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No shortened URLs yet</h2>
            <p className="text-gray-500 mb-6">Create your first shortened URL to get started!</p>
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
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Total URLs</div>
                <div className="text-3xl font-bold text-gray-900">{urls.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Total Clicks</div>
                <div className="text-3xl font-bold text-gray-900">
                  {urls.reduce((sum, url) => sum + url.clickCount, 0)}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Avg. Clicks per URL</div>
                <div className="text-3xl font-bold text-gray-900">
                  {urls.length > 0 
                    ? Math.round(urls.reduce((sum, url) => sum + url.clickCount, 0) / urls.length)
                    : 0
                  }
                </div>
              </div>
            </div>

            {/* URLs List */}
            <div className="space-y-4">
              {urls.map((url) => (
                <div key={url.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
                  <div className="p-6">
                    {/* URL Info */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-500">Short URL:</span>
                          <code className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-sm font-mono">
                            {baseUrl}/s/{url.shortCode}
                          </code>
                          <button
                            onClick={() => handleCopy(`${baseUrl}/s/${url.shortCode}`)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
                            title="Copy to clipboard"
                          >
                            Copy
                          </button>
                          <a
                            href={`${baseUrl}/s/${url.shortCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                            title="Open in new tab"
                          >
                            ↗
                          </a>
                        </div>
                        <p className="text-sm text-gray-600 break-all">
                          <span className="font-medium">Original:</span>{" "}
                          <a 
                            href={url.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-indigo-600 transition-colors"
                          >
                            {url.originalUrl}
                          </a>
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-gray-500 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-indigo-600">{url.clickCount}</span>
                        <span>{url.clickCount === 1 ? 'click' : 'clicks'}</span>
                      </div>
                      <div>
                        Created {new Date(url.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>

                    {/* Recent Clicks */}
                    {url.recentClicks.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <details className="group">
                          <summary className="cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">
                            Recent Clicks ({url.recentClicks.length})
                            <span className="ml-1 inline-block group-open:rotate-180 transition-transform">▼</span>
                          </summary>
                          <div className="mt-3 space-y-2">
                            {url.recentClicks.slice(0, 5).map((click) => (
                              <div key={click.id} className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <span className="font-medium">
                                    {new Date(click.timestamp).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                  {click.referer && (
                                    <span className="truncate max-w-xs text-gray-400">
                                      from {new URL(click.referer).hostname}
                                    </span>
                                  )}
                                </div>
                                {click.userAgent && (
                                  <div className="text-gray-400 truncate mt-1">
                                    {click.userAgent}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
