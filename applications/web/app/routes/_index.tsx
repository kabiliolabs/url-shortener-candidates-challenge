import { useActionData, useLoaderData } from 'react-router'
import type { Route } from './+types/_index'
import { baseUrl } from '@url-shortener/engine'
import { makeCreateShortUrlUseCase, makeGetRecentUrlsUseCase } from '@/lib/di.server'
import { UrlForm } from '@/components/url-form'
import { RecentUrlsList } from '@/components/recent-urls-list'

export async function loader() {
  const getRecentUrls = makeGetRecentUrlsUseCase()
  // Show last 5 URLs
  const recentUrls = await getRecentUrls.execute(5)

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
    return { error: error.message || 'An unexpected error occurred.' }
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'URL Shortener - Fast & Secure Link Management' },
    {
      name: 'description',
      content: 'Shorten your URLs quickly and beautifully with our secure link management tool.'
    }
  ]
}

export default function Index() {
  const { baseUrl, recentUrls } = useLoaderData<typeof loader>()
  // useActionData needs to be typed carefully since we're using generic any on the component
  const actionData = useActionData<typeof action>() as any

  return (
    <main className='relative min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8 font-sans overflow-hidden'>
      {/* Background Decorators */}
      <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none' />
      <div className='absolute bottom-0 right-0 w-160 h-120 bg-blue-600/5 blur-[150px] rounded-full pointer-events-none' />
      <div className='absolute top-20 left-10 w-72 h-72 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none' />

      {/* Grid Pattern */}
      <div
        className='absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none'
        style={{
          maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #000 70%, transparent 100%)'
        }}
      />

      <div className='w-full max-w-xl mx-auto flex flex-col items-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700'>
        <UrlForm actionData={actionData} />
      </div>

      <div className='w-full mx-auto relative z-10'>
        <RecentUrlsList recentUrls={recentUrls} baseUrl={baseUrl} />
      </div>
    </main>
  )
}
