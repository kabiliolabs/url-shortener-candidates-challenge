export function AppFooter() {
  return (
    <footer className="text-center text-slate-400 dark:text-slate-600 text-xs py-8 border-t border-slate-100 dark:border-slate-800 mt-auto">
      <p>
        © {new Date().getFullYear()} Kabilio Labs&nbsp;•&nbsp;
        <a href="#" className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors">Terms</a>
        &nbsp;•&nbsp;
        <a href="#" className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors">Privacy</a>
        &nbsp;•&nbsp;Simple. Fast. Fun.
      </p>
    </footer>
  )
}
