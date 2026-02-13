import { CopyButton } from "./CopyButton";

interface Click {
  id: string;
  timestamp: Date;
  referer?: string | null;
  userAgent?: string | null;
}

interface UrlCardProps {
  shortCode: string;
  originalUrl: string;
  clickCount: number;
  createdAt: Date;
  recentClicks: Click[];
  baseUrl: string;
}

/**
 * UrlCard - Displays a shortened URL with stats and actions
 * 
 * Shows URL information, click statistics, and recent click details.
 * Includes copy button and link to open the shortened URL.
 */
export function UrlCard({
  shortCode,
  originalUrl,
  clickCount,
  createdAt,
  recentClicks,
  baseUrl,
}: UrlCardProps) {
  const shortUrl = `${baseUrl}/s/${shortCode}`;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* URL Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-sm font-medium text-gray-500">
                Short URL:
              </span>
              <code className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-sm font-mono">
                {shortUrl}
              </code>
              <CopyButton textToCopy={shortUrl} variant="text" />
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                title="Open in new tab"
                aria-label="Open shortened URL in new tab"
              >
                ↗
              </a>
            </div>
            <p className="text-sm text-gray-600 break-all">
              <span className="font-medium">Original:</span>{" "}
              <a
                href={originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                {originalUrl}
              </a>
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-gray-500 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-indigo-600">{clickCount}</span>
            <span>{clickCount === 1 ? "click" : "clicks"}</span>
          </div>
          <div>
            Created{" "}
            {new Date(createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>

        {/* Recent Clicks */}
        {recentClicks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <details className="group">
              <summary className="cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">
                Recent Clicks ({recentClicks.length})
                <span className="ml-1 inline-block group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="mt-3 space-y-2">
                {recentClicks.slice(0, 5).map((click) => (
                  <div
                    key={click.id}
                    className="text-xs text-gray-500 bg-gray-50 p-2 rounded"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-medium">
                        {new Date(click.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
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
  );
}
