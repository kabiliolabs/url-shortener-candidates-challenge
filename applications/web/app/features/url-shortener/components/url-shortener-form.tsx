import { Form, useNavigation } from "react-router";

interface UrlShortenerFormProps {
  error?: string;
}

export function UrlShortenerForm({ error }: UrlShortenerFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Shorten a URL</h1>
      <p className="mt-1 text-sm text-slate-600">
        Create a compact link and track engagement in one place.
      </p>

      <Form method="post" className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-slate-700" htmlFor="url">
          Original URL
        </label>
        <input
          id="url"
          type="url"
          name="url"
          required
          placeholder="https://example.com/blog/post"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "url-error" : undefined}
        />

        {error && (
          <p id="url-error" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSubmitting ? "Creating..." : "Create short URL"}
        </button>
      </Form>
    </section>
  );
}
