export function AppFooter() {
  return (
    <footer className="text-center text-slate-400 text-xs py-8 border-t border-slate-100 mt-auto">
      <p>
        © {new Date().getFullYear()} Kabilio Labs&nbsp;•&nbsp;
        <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
        &nbsp;•&nbsp;
        <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
        &nbsp;•&nbsp;Simple. Fast. Fun.
      </p>
    </footer>
  )
}
