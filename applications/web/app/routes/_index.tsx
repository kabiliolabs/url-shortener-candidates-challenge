import { Form, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/_index";
import { getRequestIpAddress } from "../server/request-ip.server";
import { toHttpResponse } from "../server/http-error.server";
import { urlShortenerApplication } from "../server/url-shortener.server";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Alert } from "~/components/ui/alert";

type ActionData =
  | {
      ok: true;
      shortenedUrl: string;
      shortCode: string;
    }
  | {
      ok: false;
      error: string;
    };

export async function loader() {
  const result = await urlShortenerApplication.listShortLinks({ limit: 100 });

  return {
    baseUrl: process.env.PUBLIC_URL ?? "http://localhost:5173",
    items: result.items,
  };
}

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const url = String(formData.get("url") ?? "");

    const created = await urlShortenerApplication.createShortLink({
      originalUrl: url,
      ipAddress: getRequestIpAddress(request),
    });

    return {
      ok: true,
      shortenedUrl: created.shortUrl,
      shortCode: created.shortCode,
    } satisfies ActionData;
  } catch (error) {
    const response = toHttpResponse(error);
    const message = await response.text();

    return {
      ok: false,
      error: message,
    } satisfies ActionData;
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    {
      name: "description",
      content: "Shorten links with persistent storage and click analytics",
    },
  ];
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { baseUrl, items } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12">
        <header className="space-y-2">
          <p className="text-sm font-medium text-slate-600">URL Shortener</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Short links with click analytics
          </h1>
          <p className="text-sm text-slate-600">
            Base URL: <span className="font-medium">{baseUrl}</span>
          </p>
        </header>

        <Card>
          <Form method="post" className="flex flex-col gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Destination URL
              </span>
              <Input
                type="url"
                name="url"
                placeholder="https://example.com"
                required
              />
            </label>

            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create short URL"}
            </Button>
          </Form>

          {actionData?.ok && (
            <div className="mt-4">
              <Alert tone="success">
              <p className="font-medium">Short URL created</p>
              <a
                href={actionData.shortenedUrl}
                target="_blank"
                rel="noreferrer"
                className="break-all text-emerald-900 underline"
              >
                {actionData.shortenedUrl}
              </a>
              </Alert>
            </div>
          )}

          {actionData && !actionData.ok && (
            <div className="mt-4">
              <Alert tone="error">{actionData.error}</Alert>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Latest links</h2>
          {items.length === 0 ? (
            <p className="text-sm text-slate-600">No links yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-600">
                  <tr>
                    <th className="px-2 py-2 font-medium">Short URL</th>
                    <th className="px-2 py-2 font-medium">Original URL</th>
                    <th className="px-2 py-2 font-medium">Clicks</th>
                    <th className="px-2 py-2 font-medium">Last visit</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.code} className="border-t border-slate-100">
                      <td className="px-2 py-2">
                        <a
                          href={item.shortUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-700 underline"
                        >
                          {item.shortUrl}
                        </a>
                      </td>
                      <td className="max-w-[420px] truncate px-2 py-2 text-slate-700">
                        {item.originalUrl}
                      </td>
                      <td className="px-2 py-2">{item.clicks}</td>
                      <td className="px-2 py-2 text-slate-700">
                        {item.lastVisitedAt
                          ? new Date(item.lastVisitedAt).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
