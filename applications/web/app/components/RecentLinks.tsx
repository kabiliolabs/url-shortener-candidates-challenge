import { Link } from "react-router"
import { useCopy } from "../hooks/useCopy.js"
import type { LinkDto } from "../core/queries/links.js"

interface Props {
  links: LinkDto[]
  actionLinks?: LinkDto[]
}

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function RecentRow({ link }: { link: LinkDto }) {
  const { copy, copied } = useCopy()
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between gap-4 animate-fade-in">
      <div className="overflow-hidden flex-1 min-w-0">
        <p className="text-xs text-slate-400 dark:text-slate-500 truncate mb-0.5">{link.originalUrl}</p>
        <a
          href={link.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-700 dark:text-slate-200 font-bold text-sm hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          {link.shortUrl}
        </a>
      </div>
      <button
        type="button"
        onClick={() => copy(link.shortUrl)}
        title="Copy to clipboard"
        className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors shrink-0"
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  )
}

export function RecentLinks({ links, actionLinks }: Props) {
  const displayed = actionLinks ?? links
  if (displayed.length === 0) return null

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-500">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M12 7v5l4 2"/>
          </svg>
          Recent links
        </h2>
        <Link
          to="/links"
          className="text-xs font-semibold text-purple-500 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
        >
          View all →
        </Link>
      </div>
      {displayed.map((link) => (
        <RecentRow key={link.id} link={link} />
      ))}
    </section>
  )
}
