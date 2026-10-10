import { Link, NavLink } from "react-router";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
    isActive
      ? "bg-indigo-100 text-indigo-800"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <Link
          to="/"
          className="rounded-md text-lg font-semibold text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Shortly
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1">
          <NavLink to="/" end className={navLinkClass}>
            Shorten
          </NavLink>
          <NavLink to="/links" className={navLinkClass}>
            Links
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
