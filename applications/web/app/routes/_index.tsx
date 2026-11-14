import { Form, useActionData } from "react-router";
import type { Route } from "./+types/_index";
import {
  baseUrl,
  shortenedUrls,
  generateShortCode,
} from "@url-shortener/engine";

export function loader() {
  return {
    baseUrl: baseUrl ? baseUrl + "/s/" : "-",
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const url = formData.get("url") as string;

  if (!url) {
    return { error: "URL is required" };
  }

  const shortCode = generateShortCode();

  shortenedUrls.set(shortCode, url);

  return {
    shortenedUrl: `${baseUrl}/s/${shortCode}`,
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { baseUrl } = loaderData;
  const actionData = useActionData<typeof action>();

  return (
    <main className="page-shell">
      <div className="shortener-card">
        <h1 className="page-title">
          URL Shortener
        </h1>

        <Form method="post" className="shortener-form">
          <input
            type="text"
            name="url"
            placeholder="Enter your URL here..."
            required
            className="url-input"
          />

          <div className="form-details">
            <button
              type="submit"
              className="submit-button"
            >
              SHORTEN IT
            </button>
            <p className="url-hint">
              Your shortened URL will start with {baseUrl}
            </p>
          </div>
        </Form>

        {actionData?.shortenedUrl && (
          <div className="result-card">
            <p className="result-label">
              Your shortened URL:
            </p>
            <a
              href={actionData.shortenedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="result-link"
            >
              {actionData.shortenedUrl}
            </a>
          </div>
        )}

        {actionData?.error && (
          <div className="form-error">
            <p>
              {actionData.error}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
