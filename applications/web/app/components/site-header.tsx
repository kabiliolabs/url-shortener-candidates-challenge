import type { ReactNode } from "react";
import { NavLink } from "react-router";
import { cn } from "../lib/cn";

function HeaderLink({
  to,
  end,
  children,
}: {
  to: string;
  end?: boolean;
  children: ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-brand-50 text-brand-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        )
      }
    >
      {children}
    </NavLink>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
        <NavLink
          to="/"
          end
          className="flex items-center gap-2 font-mono text-lg font-bold tracking-tight text-slate-900"
        >
          <span
            aria-hidden
            className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white shadow-[0_6px_14px_-6px_rgba(127,86,217,0.9)]"
          >
            /
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-sun-400" />
          </span>
          snip
        </NavLink>
        <div className="flex items-center gap-1">
          <HeaderLink to="/" end>
            Shorten
          </HeaderLink>
          <HeaderLink to="/links">Links</HeaderLink>
        </div>
      </nav>
    </header>
  );
}
