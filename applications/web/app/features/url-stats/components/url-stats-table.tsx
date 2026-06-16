export interface UrlStatsRow {
  shortCode: string;
  originalUrl: string;
  clickCount: number;
  createdAt: string;
  lastClickedAt: string | null;
}

interface UrlStatsTableProps {
  rows: UrlStatsRow[];
  baseUrl: string;
}

export function UrlStatsTable({ rows, baseUrl }: UrlStatsTableProps) {
  if (!rows.length) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Recent links</h2>
        <p className="mt-2 text-sm text-slate-600">No shortened URLs yet.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Recent links</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="px-3 py-2 font-medium">Short URL</th>
              <th className="px-3 py-2 font-medium">Original URL</th>
              <th className="px-3 py-2 font-medium">Clicks</th>
              <th className="px-3 py-2 font-medium">Last Click</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.shortCode} className="border-b border-slate-100 align-top">
                <td className="px-3 py-3">
                  <a
                    href={`${baseUrl}/s/${row.shortCode}`}
                    className="font-medium text-blue-700 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {baseUrl}/s/{row.shortCode}
                  </a>
                </td>
                <td className="px-3 py-3 text-slate-700">
                  <span className="break-all">{row.originalUrl}</span>
                </td>
                <td className="px-3 py-3 font-medium text-slate-900">{row.clickCount}</td>
                <td className="px-3 py-3 text-slate-600">
                  {row.lastClickedAt ? new Date(row.lastClickedAt).toLocaleString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
