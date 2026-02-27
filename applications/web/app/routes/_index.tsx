import { Form, useActionData, Link } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/_index";
import {
  baseUrl,
  getOrCreateShortenedUrl,
} from "@url-shortener/engine";
import { Button, Input, Label, Alert, AlertDescription } from "~/components/ui";

export function loader() {
  return {
    baseUrl: baseUrl ? baseUrl + "/s/" : "-",
  };
}

function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const url = formData.get("url") as string;

  if (!url) {
    return { error: "URL is required" };
  }

  if (!isValidUrl(url)) {
    return {
      error: "Please enter a valid URL starting with http:// or https://"
    };
  }

  try {
    const shortCode = await getOrCreateShortenedUrl(url);

    return {
      shortenedUrl: `${baseUrl}/s/${shortCode}`,
    };
  } catch (error) {
    console.error("Error creating shortened URL:", error);
    return {
      error: `Failed to create shortened URL: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
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
  const [urlInput, setUrlInput] = useState("");
  const [clientError, setClientError] = useState("");

  const validateUrlOnChange = (value: string) => {
    setUrlInput(value);

    if (!value) {
      setClientError("");
      return;
    }

    if (!value.startsWith("http://") && !value.startsWith("https://")) {
      setClientError("URL must start with http:// or https://");
      return;
    }

    try {
      new URL(value);
      setClientError("");
    } catch {
      setClientError("Please enter a valid URL");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
            URL Shortener
          </h1>
          <p className="text-slate-600 mt-2">Create short, memorable links</p>
          <Link
            to="/stats"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Statistics
          </Link>
        </div>

        <Form method="post" className="space-y-5">
          <div>
            <Label htmlFor="url">Enter your URL</Label>
            <Input
              id="url"
              name="url"
              value={urlInput}
              onChange={(e) => validateUrlOnChange(e.target.value)}
              placeholder="https://example.com/your-long-url"
              required
              error={!!clientError}
            />
            {clientError && (
              <div className="mt-2 flex items-start gap-1.5">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600">{clientError}</p>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={!!clientError || !urlInput}
            className="w-full"
          >
            Shorten URL
          </Button>

          <p className="text-sm text-slate-500 text-center">
            Your shortened URL will start with <span className="font-medium text-slate-700">{baseUrl}</span>
          </p>
        </Form>

        {actionData?.shortenedUrl && (
          <Alert variant="success" className="p-5">
            <AlertDescription className="font-medium text-green-800 mb-3">
              Your shortened URL:
            </AlertDescription>
            <div className="flex items-center gap-2 bg-white p-3 rounded-md border border-green-300">
              <a
                href={actionData.shortenedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 break-all font-medium text-sm flex-1 transition-colors"
              >
                {actionData.shortenedUrl}
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(actionData.shortenedUrl)}
                className="flex-shrink-0 p-2"
                title="Copy to clipboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </Button>
            </div>
          </Alert>
        )}

        {actionData?.error && (
          <Alert
            variant="error"
            icon={
              <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            }
          >
            <AlertDescription className="text-red-800">
              {actionData.error}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </main>
  );
}
