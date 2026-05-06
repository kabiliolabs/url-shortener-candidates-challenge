import { Effect } from "effect"
import { Link } from "react-router"
import type { Route } from "./+types/links"
import { db } from "../infra/db.server.js"
import { buildLinkRepository } from "../infra/repo.server.js"
import { makeLinksQuery } from "../core/queries/links.js"
import { LinksTable } from "../components/LinksTable.js"
import { AppFooter } from "../components/AppFooter.js"
import { AppHeader } from "../components/AppHeader.js"

function getBaseUrl(request: Request): string {
  const url = new URL(request.url)
  return process.env.PUBLIC_URL ?? `${url.protocol}//${url.host}`
}

export async function loader({ request }: Route.LoaderArgs) {
  const repo = buildLinkRepository(db)
  const query = makeLinksQuery(repo)
  const baseUrl = getBaseUrl(request)
  const links = await Effect.runPromise(query.listAll(baseUrl))
  return { links }
}

export function meta() {
  return [{ title: "All Links · Kabilio URL Shortener" }]
}

export default function Links({ loaderData }: Route.ComponentProps) {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 flex flex-col">
      <AppHeader />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/"
            className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors text-sm font-semibold flex items-center gap-1"
          >
            ← Back
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            All links
          </h1>
        </div>
        <LinksTable links={loaderData.links} />
      </main>
      <AppFooter />
    </div>
  )
}
