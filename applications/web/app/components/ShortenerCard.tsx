import { Form, useNavigation } from "react-router"
import { useCopy } from "../hooks/useCopy.js"

interface ActionOk {
  ok: true
  shortUrl: string
  isNew: boolean
}

interface ActionErr {
  ok: false
  error: string
}

type ActionData = ActionOk | ActionErr | undefined

interface Props {
  actionData: ActionData
}

function CopyButton({ url }: { url: string }) {
  const { copy, copied } = useCopy()
  return (
    <button
      type="button"
      onClick={() => copy(url)}
      className="shrink-0 flex items-center gap-1.5 border-2 border-purple-200 dark:border-purple-700 bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-purple-600 dark:hover:bg-purple-700 hover:text-white hover:border-purple-600 transition-colors"
    >
      {copied ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Copied!
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          Copy
        </>
      )}
    </button>
  )
}

export function ShortenerCard({ actionData }: Props) {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  const hasResult = actionData?.ok === true
  const hasError = actionData?.ok === false

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 p-6 md:p-10 mb-8">
      <Form method="post" className="space-y-5">
        <div>
          <label
            htmlFor="url-input"
            className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1"
          >
            Paste your long link here
          </label>
          <input
            id="url-input"
            type="url"
            name="url"
            placeholder="https://example.com/my-very-long-url"
            autoComplete="off"
            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-base transition-all focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/30"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-pink w-full py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Shortening…
            </>
          ) : (
            <>
              <span>★</span> SHORTEN IT <span>★</span>
            </>
          )}
        </button>

        {hasError && (
          <p role="alert" className="text-red-500 dark:text-red-400 text-sm font-medium text-center pt-1">
            {(actionData as ActionErr).error}
          </p>
        )}
      </Form>

      {hasResult && (
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 animate-fade-in">
          {!(actionData as ActionOk).isNew && (
            <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">
              Already shortened — here&apos;s your existing link
            </p>
          )}
          {(actionData as ActionOk).isNew && (
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">
              Your shortened URL
            </p>
          )}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <a
              href={(actionData as ActionOk).shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-700 dark:text-purple-300 font-bold text-base break-all hover:underline"
            >
              {(actionData as ActionOk).shortUrl}
            </a>
            <CopyButton url={(actionData as ActionOk).shortUrl} />
          </div>
        </div>
      )}
    </div>
  )
}
