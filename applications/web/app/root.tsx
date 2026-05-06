import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router"
import { Provider as JotaiProvider } from "jotai"
import type { Route } from "./+types/root"
import "./app.css"

/** Runs before React hydrates — reads localStorage and sets .dark on <html>
 *  to avoid a flash of the wrong colour scheme. */
function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem('theme');var dark=(t==='dark')||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.classList.toggle('dark',dark);}catch(e){}})();`
  // eslint-disable-next-line react/no-danger
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;600;800&display=swap",
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ThemeScript />
        <Meta />
        <Links />
      </head>
      <body className="bg-[#f8fafc] dark:bg-slate-900 transition-colors duration-200">
        <JotaiProvider>
          {children}
        </JotaiProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!"
  let details = "An unexpected error occurred."
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error"
    details =
      error.status === 404
        ? "The page you're looking for doesn't exist."
        : error.statusText || details
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-8 text-center">
      <div>
        <h1 className="text-5xl font-extrabold text-slate-800 mb-4">{message}</h1>
        <p className="text-slate-500 text-lg mb-6">{details}</p>
        {stack && (
          <pre className="text-left bg-slate-100 rounded-xl p-4 text-xs overflow-x-auto max-w-2xl mx-auto">
            {stack}
          </pre>
        )}
        <a href="/" className="inline-block mt-6 btn-pink px-8 py-3 rounded-2xl font-bold text-sm">
          Go home
        </a>
      </div>
    </main>
  )
}
