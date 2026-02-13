import { Form, useActionData, Link, useNavigation } from "react-router";
import type { Route } from "./+types/_index";
import { urlService } from "~/lib/url-service.server";
import { ValidationError } from "@url-shortener/engine";
import { CopyButton } from "~/components/CopyButton";

export function loader() {
  const baseUrl = process.env.PUBLIC_URL || "http://localhost:5173";
  return { baseUrl };
}

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const url = formData.get("url") as string;

    const shortened = await urlService.createShortenedUrl(url);
    const baseUrl = process.env.PUBLIC_URL || "http://localhost:5173";

    return {
      success: true,
      shortenedUrl: `${baseUrl}/s/${shortened.shortCode}`,
      shortCode: shortened.shortCode,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error("Error creating shortened URL:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
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
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          URL Shortener
        </h1>
        <p className="text-center text-gray-600 mb-8 text-sm">
          Transform long URLs into short, shareable links
        </p>

        <Form method="post" className="space-y-4" aria-busy={isSubmitting}>
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter your URL
            </label>
            <input
              type="url"
              id="url"
              name="url"
              placeholder="https://example.com/very-long-url"
              required
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            aria-label={isSubmitting ? "Shortening URL..." : "Shorten URL"}
          >
            {isSubmitting ? "Shortening..." : "Shorten URL"}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Shortened URLs will start with {baseUrl}/s/
          </p>
        </Form>

        {actionData?.success && actionData.shortenedUrl && (
          <div
            className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md"
            role="alert"
            aria-live="polite"
          >
            <p className="text-sm font-medium text-green-800 mb-2">
              ✓ Success! Your shortened URL:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={actionData.shortenedUrl}
                className="flex-1 px-3 py-2 bg-white border border-green-300 rounded text-sm font-mono text-gray-800"
                aria-label="Shortened URL"
              />
              <CopyButton
                textToCopy={actionData.shortenedUrl}
                variant="primary"
              />
            </div>
          </div>
        )}

        {actionData?.error && (
          <div
            className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-sm text-red-800 font-medium">
              ✗ {actionData.error}
            </p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link
            to="/dashboard"
            className="block text-center text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
          >
            View all shortened URLs →
          </Link>
        </div>
      </div>
    </main>
  );
}
