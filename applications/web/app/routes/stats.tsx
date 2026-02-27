import { Link, useLoaderData } from "react-router";
import { prisma } from "@url-shortener/engine";
import {
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge
} from "~/components/ui";

export async function loader() {
  const urls = await prisma.shortenedUrl.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return { urls };
}

export function meta() {
  return [
    { title: "URL Statistics - URL Shortener" },
    { name: "description", content: "View statistics for all shortened URLs" },
  ];
}

type ShortenedUrl = {
  id: string;
  shortCode: string;
  originalUrl: string;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
};

export default function Stats() {
  const { urls } = useLoaderData<{ urls: ShortenedUrl[] }>();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                URL Statistics
              </h1>
              <p className="text-slate-600">
                View all shortened URLs and their analytics
              </p>
            </div>
            <Button asChild size="sm">
              <Link to="/">← Back to Home</Link>
            </Button>
          </div>

          {urls.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                No URLs yet
              </h2>
              <p className="text-slate-600 mb-4">
                Create your first shortened URL to see statistics here
              </p>
              <Button asChild size="sm">
                <Link to="/">Create URL</Link>
              </Button>
            </div>
          ) : (
            <>
            <Table>
              <TableHeader>
                <tr>
                  <TableHead className="text-left">Short Code</TableHead>
                  <TableHead className="text-left">Original URL</TableHead>
                  <TableHead className="text-center">Clicks</TableHead>
                  <TableHead className="text-left">Created</TableHead>
                  <TableHead className="text-left">Last Clicked</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {urls.map((url: ShortenedUrl) => (
                  <TableRow key={url.id}>
                    <TableCell>
                        <a
                          href={`/s/${url.shortCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          {url.shortCode}
                        </a>
                    </TableCell>
                    <TableCell>
                      <a
                        href={url.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-600 hover:text-slate-800 text-sm max-w-md truncate block"
                        title={url.originalUrl}
                      >
                        {url.originalUrl}
                      </a>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge>{url.clicks}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {new Date(url.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(url.createdAt).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {new Date(url.updatedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(url.updatedAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${window.location.origin}/s/${url.shortCode}`
                            );
                          }}
                          className="p-2"
                          title="Copy short URL"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
              <div className="flex items-center gap-2">
                Total URLs: <Badge variant="secondary">{urls.length}</Badge>
              </div>
              <div className="flex items-center gap-2">
                Total Clicks: <Badge>{urls.reduce((sum: number, url: ShortenedUrl) => sum + url.clicks, 0)}</Badge>
              </div>
            </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
