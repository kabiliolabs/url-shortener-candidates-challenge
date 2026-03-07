import { Form, useNavigation } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Link2, Sparkles, Loader2, AlertCircle } from 'lucide-react'

interface UrlFormProps {
  actionData?: {
    shortenedUrl?: string
    error?: string | null
  }
}

export function UrlForm({ actionData }: UrlFormProps) {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  return (
    <Card className='w-full border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-2xl relative overflow-hidden'>
      <div className='absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none' />
      
      <CardHeader className='relative z-10 text-center pb-8'>
        <div className='mx-auto mb-4 w-12 h-12 bg-emerald-500/10 flex items-center justify-center rounded-2xl border border-emerald-500/20'>
          <Link2 className='w-6 h-6 text-emerald-400' />
        </div>
        <CardTitle className='text-3xl font-bold tracking-tight text-white'>
          URL Shortener
        </CardTitle>
        <CardDescription className='text-zinc-400 mt-2 text-base'>
          Paste your long URL below to create a concise, shareable link instantly.
        </CardDescription>
      </CardHeader>
      
      <CardContent className='relative z-10 space-y-6'>
        <Form method='post' className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='url' className='text-zinc-300 font-medium'>
              Long URL
            </Label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Sparkles className='h-4 w-4 text-zinc-500' />
              </div>
              <Input
                id='url'
                type='url'
                name='url'
                placeholder='https://example.com/very/long/path/to/something'
                required
                className='pl-10 h-12 bg-zinc-950/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50'
              />
            </div>
          </div>
          
          <Button 
            type='submit' 
            disabled={isSubmitting}
            className='w-full h-12 bg-emerald-600/90 hover:bg-emerald-500 text-white font-medium text-base transition-all duration-300 group'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                Shortening...
              </>
            ) : (
              <>
                Shorten URL
                <Link2 className='ml-2 h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity' />
              </>
            )}
          </Button>
        </Form>

        {/* Result Area */}
        {actionData?.shortenedUrl && (
          <div className='animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-xl bg-emerald-950/40 border border-emerald-900/50 p-4 pt-5 mt-6'>
            <Label className='text-emerald-400/80 text-xs font-semibold uppercase tracking-wider mb-2 block'>
              Your Short URL
            </Label>
            <div className='flex items-center gap-3'>
              <div className='bg-zinc-950 rounded-lg py-2 px-3 border border-zinc-800 flex-1 truncate'>
                <a 
                  href={actionData.shortenedUrl} 
                  target='_blank' 
                  rel='noopener noreferrer'
                  className='text-emerald-300 hover:text-emerald-200 font-mono text-sm sm:text-base hover:underline'
                >
                  {actionData.shortenedUrl}
                </a>
              </div>
              <Button 
                variant='outline' 
                size='icon'
                className='h-10 w-10 border-emerald-900/50 hover:bg-emerald-900/50 hover:text-emerald-100'
                onClick={() => {
                  navigator.clipboard.writeText(actionData.shortenedUrl!)
                  // Here we could add a small toast notification later
                }}
                title='Copy to clipboard'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor'
                  strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'
                >
                  <rect width='14' height='14' x='8' y='8' rx='2' ry='2' />
                  <path d='M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' />
                </svg>
              </Button>
            </div>
          </div>
        )}

        {actionData?.error && (
          <div className='animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-xl bg-red-950/40 border border-red-900/50 p-4 flex items-start gap-3 mt-6'>
            <AlertCircle className='h-5 w-5 text-red-500 shrink-0 mt-0.5' />
            <div>
              <Label className='text-red-400/80 text-xs font-semibold uppercase tracking-wider mb-1 block'>
                Error
              </Label>
              <p className='text-red-200 text-sm'>{actionData.error}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
