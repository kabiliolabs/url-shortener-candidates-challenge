import { Link } from "react-router"
import { DarkModeToggle } from "./DarkModeToggle.js"

export function AppHeader() {
  return (
    <header className="w-full border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-10 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="font-extrabold text-slate-800 dark:text-slate-100 hover:text-pink-500 dark:hover:text-pink-400 transition-colors text-sm tracking-wide"
        >
          URL Shortener
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/links"
            className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
          >
            All links
          </Link>
          <DarkModeToggle />
        </div>
      </div>
    </header>
  )
}
