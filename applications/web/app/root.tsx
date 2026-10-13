import {
  isRouteErrorResponse,
  Links,
  Link,
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
  let details = "An unexpected error occurred.";
  let status = "500";

  if (isRouteErrorResponse(error)) {
    status = String(error.status);
    message = error.status === 404 ? "Page not found" : "Request failed";
    details =
      error.status === 404
        ? "The short URL or page you requested does not exist."
        : error.statusText || details;
  }

  return (
    <main className="flex min-h-screen items-center bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200 sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">URL management</p>
        <p className="mt-8 text-7xl font-bold tracking-tight text-slate-200">{status}</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{message}</h1>
        <p className="mx-auto mt-3 max-w-lg text-slate-600">{details}</p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
