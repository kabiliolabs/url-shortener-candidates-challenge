import { useCopy } from "../hooks/useCopy.js"
import type { LinkDto } from "../core/queries/links.js"

interface Props {
  links: LinkDto[]
}

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function CopyCell({ url }: { url: string }) {
  const { copy, copied } = useCopy()
  return (
    <button
      type="button"
      onClick={() => copy(url)}
      className="inline-flex items-center gap-1.5 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 text-xs font-semibold transition-colors"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  )
}

export function LinksTable({ links }: Props) {
  if (links.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-12 text-center">
        <p className="text-slate-400 dark:text-slate-500 font-medium">No links shortened yet.</p>
        <p className="text-slate-300 dark:text-slate-600 text-sm mt-1">
          Go to the home page and shorten your first link.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700 text-left">
              <th className="px-5 py-4 font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Short link</th>
              <th className="px-5 py-4 font-semibold text-slate-500 dark:text-slate-400">Original URL</th>
              <th className="px-5 py-4 font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap text-right">Clicks</th>
              <th className="px-5 py-4 font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Created</th>
              <th className="px-5 py-4 font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Last click</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {links.map((link) => (
              <tr key={link.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <a
                      href={link.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                    >
                      /go/{link.code}
                    </a>
                    <CopyCell url={link.shortUrl} />
                  </div>
                </td>
                <td className="px-5 py-3.5 max-w-xs">
                  <span
                    className="block truncate text-slate-500 dark:text-slate-400 font-mono text-xs"
                    title={link.originalUrl}
                  >
                    {link.originalUrl}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-500"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    {link.clickCount}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-400 dark:text-slate-500 whitespace-nowrap text-xs">
                  {formatDate(link.createdAt)}
                </td>
                <td className="px-5 py-3.5 text-slate-400 dark:text-slate-500 whitespace-nowrap text-xs">
                  {formatDate(link.lastClickAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
