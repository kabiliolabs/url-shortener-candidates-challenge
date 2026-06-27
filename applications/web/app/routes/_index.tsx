import { Form, useActionData, useNavigation } from 'react-router';
import type { Route } from './+types/_index';
import {
  validateUrl,
  generateUniqueCode,
  createShortUrl,
  listShortUrls,
  buildShortUrl,
  AppError,
  checkRateLimit,
} from '@url-shortener/engine';
import { CopyButton } from '~/components/CopyButton';

export async function loader() {
  const urls = await listShortUrls();
  const publicUrl = process.env.PUBLIC_URL ?? '';
  return { urls, publicUrl };
}

export async function action({ request }: Route.ActionArgs) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1';

  try {
    checkRateLimit(ip);
  } catch (err) {
    if (err instanceof AppError) return { error: err.message };
    return { error: 'Too many requests' };
  }

  const formData = await request.formData();
  const raw = (formData.get('url') as string) ?? '';

  let validUrl: string;
  try {
    validUrl = validateUrl(raw);
  } catch (err) {
    if (err instanceof AppError) return { error: err.message };
    return { error: 'Invalid URL' };
  }

  try {
    const code = await generateUniqueCode();
    await createShortUrl(code, validUrl);
    const publicUrl = process.env.PUBLIC_URL ?? '';
    return { shortUrl: buildShortUrl(code, publicUrl) };
  } catch (err) {
    if (err instanceof AppError) return { error: err.message };
    return { error: 'Something went wrong' };
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'URL Shortener' },
    { name: 'description', content: 'Shorten your URLs quickly and easily' },
  ];
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { urls, publicUrl } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">URL Shortener</h1>
          <p className="mt-1 text-gray-500 text-sm">Paste a long URL and get a short link instantly.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <Form method="post" className="flex flex-col gap-4">
            <div className="flex gap-2">
              <input
                type="text"
                name="url"
                placeholder="https://example.com/very/long/url"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                aria-label="URL to shorten"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Shortening...' : 'Shorten'}
              </button>
            </div>

            <div aria-live="polite">
              {actionData?.error && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-red-500 text-xs">&#9679;</span>
                  <p className="text-sm text-red-600">{actionData.error}</p>
                </div>
              )}
              {actionData?.shortUrl && (
                <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-green-500 text-base">&#10003;</span>
                  <a
                    href={actionData.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-sm font-mono text-blue-700 hover:underline break-all"
                  >
                    {actionData.shortUrl}
                  </a>
                  <CopyButton text={actionData.shortUrl} />
                </div>
              )}
            </div>
          </Form>
        </div>

        {urls.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Recent links</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-gray-400 bg-gray-50">
                    <th className="px-6 py-3 text-left font-medium">Original URL</th>
                    <th className="px-6 py-3 text-left font-medium">Short URL</th>
                    <th className="px-6 py-3 text-right font-medium">Clicks</th>
                    <th className="px-6 py-3 text-right font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {urls.map((url) => (
                    <tr key={url.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 max-w-xs truncate text-gray-600">
                        <a
                          href={url.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-gray-900 hover:underline"
                        >
                          {url.originalUrl}
                        </a>
                      </td>
                      <td className="px-6 py-3 font-mono">
                        <a
                          href={buildShortUrl(url.code, publicUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {buildShortUrl(url.code, publicUrl)}
                        </a>
                      </td>
                      <td className="px-6 py-3 text-right text-gray-600 tabular-nums">
                        {url.clickCount}
                      </td>
                      <td className="px-6 py-3 text-right text-gray-400 tabular-nums">
                        {new Date(url.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {urls.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-12 text-center">
            <p className="text-sm text-gray-400">No links shortened yet. Paste a URL above to get started.</p>
          </div>
        )}

      </div>
    </main>
  );
}
