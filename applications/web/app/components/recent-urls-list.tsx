import { MousePointerClick, ExternalLink, Calendar, Link as LinkIcon } from 'lucide-react'

type UrlDto = {
  id: string
  originalUrl: string
  shortCode: string
  clicks: number
  createdAt: Date | string
}

interface RecentUrlsListProps {
  recentUrls: UrlDto[]
  baseUrl: string
}

export function RecentUrlsList({ recentUrls, baseUrl }: RecentUrlsListProps) {
  if (!recentUrls || recentUrls.length === 0) return null

  return (
    <div className='w-full max-w-2xl mx-auto space-y-6 mt-16 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both'>
      <div className='flex items-center gap-2 px-1'>
        <div className='p-1.5 bg-zinc-800/50 rounded-md border border-zinc-700/50'>
          <MousePointerClick className='w-4 h-4 text-zinc-400' />
        </div>
        <h2 className='text-xl text-white font-semibold tracking-tight'>
          Recent Links
        </h2>
      </div>
      
      <div className='grid gap-3'>
        {recentUrls.map((url, i) => (
          <div 
            key={url.id}
            className='group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800 hover:border-zinc-700/80 transition-all duration-300'
            style={{ animationDelay: `${200 + i * 100}ms` }}
          >
            <div className='absolute inset-0 bg-linear-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-transparent rounded-2xl transition-all duration-500 pointer-events-none' />
            
            <div className='flex-1 min-w-0 flex items-start sm:items-center gap-4 w-full relative z-10'>
              <div className='hidden sm:flex shrink-0 w-10 h-10 rounded-full bg-zinc-950 border border-zinc-800 items-center justify-center group-hover:border-emerald-500/30 group-hover:bg-emerald-950/20 transition-colors'>
                <LinkIcon className='w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors' />
              </div>
              
              <div className='flex-1 min-w-0 space-y-1.5 w-full'>
                <div className='flex items-center gap-2'>
                  <a
                    href={`${baseUrl}${url.shortCode}`}
                    target='_blank'
                    rel='noreferrer'
                    className='text-emerald-400 font-mono text-sm sm:text-base font-medium truncate hover:text-emerald-300 hover:underline flex items-center gap-1.5'
                  >
                    {baseUrl}
                    <span className='text-zinc-100 font-bold bg-zinc-800/80 px-1.5 py-0.5 rounded'>{url.shortCode}</span>
                    <ExternalLink className='w-3 h-3 opacity-50' />
                  </a>
                </div>
                
                <p 
                  className='text-sm text-zinc-400 truncate max-w-[280px] sm:max-w-md w-full'
                  title={url.originalUrl}
                >
                  {url.originalUrl}
                </p>
                
                <div className='flex items-center gap-4 text-xs text-zinc-500 sm:hidden mt-2 pt-2 border-t border-zinc-800'>
                  <div className='flex items-center gap-1.5 bg-zinc-950/80 px-2 py-1 rounded-md border border-zinc-800/80'>
                    <MousePointerClick className='w-3.5 h-3.5 text-zinc-400' />
                    <span className='font-medium text-zinc-300'>{url.clicks}</span>
                  </div>
                  <div className='flex items-center gap-1.5 text-zinc-500'>
                    <Calendar className='w-3.5 h-3.5' />
                    <span>{new Date(url.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className='hidden sm:flex shrink-0 items-center gap-6 relative z-10'>
              <div className='flex flex-col items-end gap-1'>
                <div className='flex items-center gap-1.5 text-xs text-zinc-500'>
                  <Calendar className='w-3.5 h-3.5 opacity-70' />
                  <span>{new Date(url.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className='flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 shadow-inner min-w-20 justify-center'>
                <MousePointerClick className='w-3.5 h-3.5 text-emerald-500/70' />
                <span className='font-mono font-medium tracking-tight text-white'>{url.clicks}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
