import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header className="border-b border-gray-200 dark:border-gray-800">
          <nav className="mx-auto flex max-w-5xl gap-6 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Link to="/" className="hover:text-blue-700 dark:hover:text-blue-400">
              Shorten
            </Link>
            <Link to="/urls" className="hover:text-blue-700 dark:hover:text-blue-400">
              Stats
            </Link>
          </nav>
        </header>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Something went wrong";
  let details = "An unexpected error occurred. Please try again.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error) && error.status === 404) {
    message = "Page not found";
    details = "This short link doesn't exist or the page could not be found.";
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-16 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-semibold">{message}</h1>
      <p className="text-gray-600 dark:text-gray-400">{details}</p>
      <Link to="/" className="text-blue-700 underline dark:text-blue-400">
        Back to home
      </Link>
      {stack && (
        <pre className="w-full overflow-x-auto p-4 text-xs">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
