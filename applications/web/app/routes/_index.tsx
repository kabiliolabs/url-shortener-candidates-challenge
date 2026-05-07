import { useActionData } from "react-router"
import type { Route } from "./+types/_index"
import { baseUrl, shortenUrl, checkRateLimit, getAllUrls } from "@url-shortener/engine"
import { ShortenForm } from "~/components/shorten-form"
import { UrlCard } from "~/components/url-card"

export async function loader() {
  const urls = await getAllUrls()
  return { baseUrl: baseUrl ? baseUrl + "/s/" : "-", urls }
}

export async function action({ request }: Route.ActionArgs) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown"
  const allowed = await checkRateLimit(ip)
  if (!allowed) return { error: "Too many requests. Please wait a moment." }

  const formData = await request.formData()
  const url = formData.get("url") as string

  if (!url) return { error: "URL is required" }

  const { code } = await shortenUrl(url)
  return { shortenedUrl: `${baseUrl}/s/${code}` }
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "URL Shortener" }]
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const actionData = useActionData<typeof action>()
  const { baseUrl: base, urls } = loaderData

  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-lime-400 via-pink-500 to-cyan-300 p-4 pt-12 gap-6">
      <div className="w-full max-w-md bg-yellow-300 p-10 rounded-none border-8 border-dashed border-purple-600 rotate-1 shadow-2xl shadow-red-500">
        <h1 className="text-3xl font-mono italic text-center mb-8 text-fuchsia-600 underline decoration-wavy decoration-green-500 tracking-widest">
          ~*~ URL Shortener ~*~
        </h1>
        <ShortenForm baseUrl={base} error={actionData?.error} />
        {actionData?.shortenedUrl && (
          <UrlCard shortenedUrl={actionData.shortenedUrl} />
        )}
      </div>

      {urls.length > 0 && (
        <div className="w-full max-w-md bg-cyan-200 border-8 border-double border-orange-500 -rotate-1 shadow-2xl shadow-purple-500 p-6">
          <h2 className="text-xl font-mono font-black text-center text-orange-600 underline decoration-wavy decoration-blue-500 mb-4 uppercase tracking-widest">
            ★ All URLs ★
          </h2>
          <ul className="flex flex-col gap-3 max-h-80 overflow-y-auto">
            {urls.map((url) => (
              <li key={url.id} className="bg-yellow-100 border-4 border-dotted border-purple-500 p-3">
                <a
                  href={`/s/${url.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm font-black text-fuchsia-700 hover:text-red-600 block"
                >
                  {base}{url.code}
                </a>
                <p className="text-xs text-indigo-700 font-mono truncate mt-1">{url.originalUrl}</p>
                <p className="text-xs font-black text-orange-600 mt-1">{url.clicks} clicks</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}
