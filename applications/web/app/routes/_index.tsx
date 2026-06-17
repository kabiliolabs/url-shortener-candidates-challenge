import { useActionData } from "react-router";
import type { Route } from "./+types/_index";
import { baseUrl } from "@url-shortener/engine";
import { createUrl } from "@url-shortener/database";
import { ShortenedUrlDisplay } from "~/components/shortened-url-display";
import { UrlForm } from "~/components/url-form";

export function loader() {
  return {
    baseUrl: baseUrl ? `${baseUrl}/s/` : "/s/",
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const url = formData.get("url");

  if (typeof url !== "string" || url.trim().length === 0) {
    return { error: "URL is required" };
  }

  try {
    const record = await createUrl(url.trim());

    return {
      shortenedUrl: `${baseUrl}/s/${record.shortCode}`,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to shorten URL";

    return { error: message };
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { baseUrl: shortLinkBase } = loaderData;
  const actionData = useActionData<typeof action>();

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-lg items-center px-4 py-8">
      <div className="flex w-full flex-col gap-6">
        <UrlForm baseUrl={shortLinkBase} error={actionData?.error} />

        {actionData?.shortenedUrl ? (
          <ShortenedUrlDisplay shortenedUrl={actionData.shortenedUrl} />
        ) : null}
      </div>
    </main>
  );
}
