import { useActionData } from "react-router"
import type { Route } from "./+types/_index"
import { baseUrl, shortenUrl, checkRateLimit } from "@url-shortener/engine"
import { ShortenForm } from "~/components/shorten-form"
import { UrlCard } from "~/components/url-card"

export function loader() {
  return { baseUrl: baseUrl ? baseUrl + "/s/" : "-" }
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

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-400 via-pink-500 to-cyan-300 p-4">
      <div className="w-full max-w-md bg-yellow-300 p-10 rounded-none border-8 border-dashed border-purple-600 rotate-1 shadow-2xl shadow-red-500">
        <h1 className="text-3xl font-mono italic text-center mb-8 text-fuchsia-600 underline decoration-wavy decoration-green-500 tracking-widest">
          ~*~ URL Shortener ~*~
        </h1>
        <ShortenForm baseUrl={loaderData.baseUrl} error={actionData?.error} />
        {actionData?.shortenedUrl && (
          <UrlCard shortenedUrl={actionData.shortenedUrl} />
        )}
      </div>
    </main>
  )
}
