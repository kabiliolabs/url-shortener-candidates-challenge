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
    <main className="min-h-screen bg-(--color-bg) py-16 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            URL{' '}
            <span className="glow-accent text-(--color-accent)">Shortener</span>
          </h1>
          <p className="mt-1 text-sm text-(--color-muted)">
            Paste a long URL and get a short link instantly.
          </p>
        </div>

        <div className="card-border rounded-2xl p-6 bg-(--color-paper)">
          <Form method="post" className="flex flex-col gap-4">
            <div className="flex gap-2">
              <input
                type="text"
                name="url"
                placeholder="https://example.com/very/long/url"
                className="glow-input flex-1 px-4 py-2.5 rounded-lg text-sm outline-none transition-colors bg-(--color-bg) border border-(--color-border) text-white placeholder:text-(--color-subtle)"
                aria-label="URL to shorten"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="glow-btn bg-(--color-accent) text-(--color-bg) px-5 py-2.5 text-sm font-semibold rounded-lg cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              >
                {isSubmitting ? 'Shortening...' : 'Shorten'}
              </button>
            </div>

            <div aria-live="polite">
              {actionData?.error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-(--color-error-bg) border border-(--color-error-border)">
                  <span className="text-xs text-(--color-error)">&#9679;</span>
                  <p className="text-sm text-(--color-error)">{actionData.error}</p>
                </div>
              )}
              {actionData?.shortUrl && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-(--color-success-bg) border border-(--color-success-border)">
                  <span className="text-(--color-accent)">&#10003;</span>
                  <a
                    href={actionData.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-sm font-mono break-all text-(--color-accent) hover:text-(--color-accent-light) transition-colors hover:underline"
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
          <div className="card-border rounded-2xl overflow-hidden bg-(--color-paper)">
            <div className="px-6 py-4 border-b border-(--color-border)">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-(--color-subtle)">
                Recent links
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-(--color-thead-bg) text-xs uppercase tracking-wide text-(--color-subtle)">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Original URL</th>
                    <th className="px-6 py-3 text-left font-medium">Short URL</th>
                    <th className="px-6 py-3 text-right font-medium">Clicks</th>
                    <th className="px-6 py-3 text-right font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {urls.map((url) => (
                    <tr
                      key={url.id}
                      className="border-t border-(--color-border-row) hover:bg-(--color-row-hover) transition-colors"
                    >
                      <td className="px-6 py-3 max-w-xs truncate">
                        <a
                          href={url.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-(--color-muted) hover:text-white transition-colors hover:underline"
                        >
                          {url.originalUrl}
                        </a>
                      </td>
                      <td className="px-6 py-3 font-mono">
                        <a
                          href={buildShortUrl(url.code, publicUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-(--color-accent) hover:text-(--color-accent-light) transition-colors hover:underline"
                        >
                          {buildShortUrl(url.code, publicUrl)}
                        </a>
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums text-(--color-muted)">
                        {url.clickCount}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums text-(--color-subtle)">
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
          <div className="card-border rounded-2xl px-6 py-12 text-center bg-(--color-paper)">
            <p className="text-sm text-(--color-subtle)">
              No links shortened yet. Paste a URL above to get started.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
