import { useActionData } from "react-router"
import type { Route } from "./+types/_index"
import { baseUrl, shortenUrl } from "@url-shortener/engine"
import { ShortenForm } from "~/components/shorten-form"
import { UrlCard } from "~/components/url-card"

export function loader() {
  return { baseUrl: baseUrl ? baseUrl + "/s/" : "-" }
}

export async function action({ request }: Route.ActionArgs) {
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
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-2">
        <h1 className="text-2xl font-bold text-center">URL Shortener</h1>
        <ShortenForm
          baseUrl={loaderData.baseUrl}
          error={actionData?.error}
        />
        {actionData?.shortenedUrl && (
          <UrlCard shortenedUrl={actionData.shortenedUrl} />
        )}
      </div>
    </main>
  )
}
