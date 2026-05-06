import { Effect } from "effect"
import { data } from "react-router"
import type { Route } from "./+types/home"
import { db } from "../infra/db.server.js"
import { buildLinkRepository } from "../infra/repo.server.js"
import { makeShortenCommand } from "../core/commands/shorten.js"
import { makeLinksQuery } from "../core/queries/links.js"
import { domainErrorMessage } from "../core/errors.js"
import { ShortenerCard } from "../components/ShortenerCard.js"
import { RecentLinks } from "../components/RecentLinks.js"
import { AppFooter } from "../components/AppFooter.js"
import { AppHeader } from "../components/AppHeader.js"

function getBaseUrl(request: Request): string {
  const url = new URL(request.url)
  return process.env.PUBLIC_URL ?? `${url.protocol}//${url.host}`
}

function getClientKey(request: Request): string {
  return (
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "anonymous"
  )
}

export async function loader({ request }: Route.LoaderArgs) {
  const repo = buildLinkRepository(db)
  const query = makeLinksQuery(repo)
  const baseUrl = getBaseUrl(request)
  const recentLinks = await Effect.runPromise(query.listRecent(3, baseUrl))
  return { recentLinks }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const rawUrl = (formData.get("url") as string) ?? ""
  const baseUrl = getBaseUrl(request)
  const clientKey = getClientKey(request)

  const repo = buildLinkRepository(db)
  const shorten = makeShortenCommand(repo)
  const query = makeLinksQuery(repo)

  const result = await Effect.runPromise(
    shorten(rawUrl, clientKey).pipe(
      Effect.matchEffect({
        onSuccess: ({ link, isNew }) =>
          Effect.map(query.listRecent(3, baseUrl), (recentLinks) =>
            data({
              ok: true as const,
              shortUrl: `${baseUrl}/go/${link.code}`,
              isNew,
              recentLinks,
            }),
          ),
        onFailure: (err) =>
          Effect.succeed(
            data({ ok: false as const, error: domainErrorMessage(err) }),
          ),
      }),
    ),
  )

  return result
}

export function meta() {
  return [
    { title: "URL Shortener · Kabilio" },
    { name: "description", content: "Shorten links quickly, simply, and without distractions." },
  ]
}

export default function Home({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 flex flex-col">
      <AppHeader />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight text-slate-800 dark:text-slate-100">
            <span className="wavy-underline">URL Shortener</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-sm mx-auto">
            Shorten your links quickly, simply, and without distractions.
          </p>
        </header>

        <div className="w-full max-w-xl">
          <ShortenerCard actionData={actionData} />

          {loaderData.recentLinks.length > 0 && (
            <RecentLinks
              links={loaderData.recentLinks}
              actionLinks={
                actionData && "recentLinks" in actionData
                  ? actionData.recentLinks
                  : undefined
              }
            />
          )}
        </div>
      </main>
      <AppFooter />
    </div>
  )
}
