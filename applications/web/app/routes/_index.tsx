import { Form, useActionData, useLoaderData } from 'react-router'
import type { Route } from './+types/_index'
import { baseUrl } from '@url-shortener/engine'
import { makeCreateShortUrlUseCase, makeGetRecentUrlsUseCase } from '@/lib/di.server'

export async function loader() {
  const getRecentUrls = makeGetRecentUrlsUseCase()
  const recentUrls = await getRecentUrls.execute(5) // Show last 5

  return {
    baseUrl: baseUrl ? baseUrl + '/s/' : '-',
    recentUrls
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const url = formData.get('url') as string

  if (!url) {
    return { error: 'URL is required' }
  }

  const createShortUrl = makeCreateShortUrlUseCase()

  try {
    const result = await createShortUrl.execute({ url })
    return {
      shortenedUrl: `${baseUrl}/s/${result.shortCode}`,
      error: null
    }
  } catch (error: any) {
    // Assuming DomainError exposes .message
    return { error: error.message || 'An unexpected error occurred.' }
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'URL Shortener' },
    { name: 'description', content: 'Shorten your URLs quickly and easily' }
  ]
}

export default function Index() {
  const { baseUrl, recentUrls } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <main className='min-h-screen flex items-center justify-center bg-zinc-950 p-6 font-sans'>
      <div className='w-full max-w-xl mx-auto space-y-8'>
        {/* Header */}
        <div className='text-center space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
            URL Shortener
          </h1>
          <p className='text-zinc-400'>
            Paste your long URL below to create a concise, shareable link.
          </p>
        </div>

        {/* Action Form */}
        <div className='bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl'>
          <Form method='post' className='space-y-4'>
            <div className='space-y-2'>
              <label htmlFor='url' className='text-sm font-medium text-zinc-300'>
                Long URL
              </label>
              <input
                id='url'
                type='url'
                name='url'
                placeholder='https://example.com/very/long/path'
                required
                className='flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors'
              />
            </div>
            <button
              type='submit'
              className='w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 text-white hover:bg-emerald-700 h-10 px-4 py-2'
            >
              Shorten URL
            </button>
          </Form>

          {/* Result Messages */}
          {actionData?.shortenedUrl && (
            <div className='mt-6 p-4 bg-emerald-950/30 border border-emerald-900/50 rounded-lg'>
              <p className='text-sm font-medium text-emerald-400 mb-1'>
                Success! Your short link is ready:
              </p>
              <a
                href={actionData.shortenedUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='text-lg font-mono text-emerald-300 hover:text-emerald-200 hover:underline break-all'
              >
                {actionData.shortenedUrl}
              </a>
            </div>
          )}

          {actionData?.error && (
            <div className='mt-6 p-4 bg-red-950/30 border border-red-900/50 rounded-lg'>
              <p className='text-sm font-medium text-red-500'>{actionData.error}</p>
            </div>
          )}
        </div>

        {/* Recent URLs */}
        {recentUrls && recentUrls.length > 0 && (
          <div className='space-y-4'>
            <h2 className='text-lg font-semibold text-white'>Recent Short Links</h2>
            <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden'>
              <ul className='divide-y divide-zinc-800'>
                {recentUrls.map(url => (
                  <li
                    key={url.id}
                    className='p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-800/50 transition-colors'
                  >
                    <div className='min-w-0 flex-1'>
                      <p className='text-sm text-zinc-400 truncate mb-1'>{url.originalUrl}</p>
                      <a
                        href={`${baseUrl}${url.shortCode}`}
                        target='_blank'
                        rel='noreferrer'
                        className='text-sm font-mono text-emerald-400 hover:text-emerald-300 hover:underline'
                      >
                        {baseUrl}
                        {url.shortCode}
                      </a>
                    </div>
                    <div className='flex items-center gap-2 text-xs text-zinc-500 bg-zinc-950 px-2 py-1 rounded-md border border-zinc-800'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='14'
                        height='14'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <path d='M12 20h9' />
                        <path d='M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z' />
                      </svg>
                      {url.clicks} clicks
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
