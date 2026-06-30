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
import { SiteHeader } from "./components/site-header";
import { Card } from "./components/card";
import { buttonClassName } from "./components/button";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Space+Grotesk:wght@500;600;700&family=Space+Mono:wght@400;700&display=swap",
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
  let eyebrow = "Error";
  let title = "Something went wrong";
  let details = "An unexpected error occurred. Please try again.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    eyebrow = String(error.status);
    if (error.status === 404) {
      title = "Page not found";
      details = "The page you're looking for doesn't exist or has moved.";
    } else {
      details = error.statusText || details;
    }
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-5 py-16">
        <Card className="w-full p-8 sm:p-10">
          <p className="font-mono text-sm font-medium text-brand-600">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-3 text-slate-600">{details}</p>
          <Link to="/" className={buttonClassName("primary", "mt-6")}>
            Back to home
          </Link>
          {stack && (
            <pre className="mt-6 overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
              <code>{stack}</code>
            </pre>
          )}
        </Card>
      </main>
    </div>
  );
}
