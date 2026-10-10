import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { SiteHeader } from "~/components/site-header";
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
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
        <Outlet />
      </main>
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;
  const title = isNotFound ? "Page not found" : "Something went wrong";
  const details = isNotFound
    ? "The page you are looking for does not exist."
    : "An unexpected error occurred. Please try again in a moment.";
  const stack =
    import.meta.env.DEV && error instanceof Error ? error.stack : undefined;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center gap-3 px-4 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="text-slate-600">{details}</p>
      <a
        href="/"
        className="text-indigo-700 underline underline-offset-2 hover:text-indigo-900"
      >
        Back to home
      </a>
      {stack && (
        <pre className="overflow-x-auto rounded-md bg-slate-100 p-4 text-xs">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
