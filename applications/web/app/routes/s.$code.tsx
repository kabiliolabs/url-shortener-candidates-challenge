import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { makeGetUrlByCodeUseCase, makeIncrementClickUseCase } from '@/lib/di.server'

export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params

  const getUrlByCode = makeGetUrlByCodeUseCase()
  const incrementClick = makeIncrementClickUseCase()

  try {
    const urlPayload = await getUrlByCode.execute(code)

    // We intentionally don't await this if we want fire-and-forget stats,
    // but waiting ensures data consistency.
    await incrementClick.execute(code)

    return redirect(urlPayload.originalUrl)
  } catch (error: any) {
    // If DomainError is thrown (UrlNotFoundError), we render 404
    throw new Response('Not Found', { status: 404 })
  }
}

export function ErrorBoundary() {
  return (
    <div className='min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center space-y-6'>
      <div className='text-zinc-500'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='64'
          height='64'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='1'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <circle cx='12' cy='12' r='10' />
          <path d='M16 16s-1.5-2-4-2-4 2-4 2' />
          <line x1='9' x2='9.01' y1='9' y2='9' />
          <line x1='15' x2='15.01' y1='9' y2='9' />
        </svg>
      </div>
      <h1 className='text-4xl font-bold text-zinc-100 tracking-tight'>404 - Link Not Found</h1>
      <p className='text-zinc-400 max-w-md'>
        The short link you clicked might be expired, typed incorrectly, or no longer exists.
      </p>
      <a
        href='/'
        className='inline-flex h-10 items-center justify-center rounded-md bg-zinc-100 px-8 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400'
      >
        Go back home
      </a>
    </div>
  )
}
