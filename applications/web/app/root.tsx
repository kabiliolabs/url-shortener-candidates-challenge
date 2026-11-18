import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { ErrorPage } from "./components/error-page";
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
        <meta
          name="theme-color"
          content="#ebebd8"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#455230"
          media="(prefers-color-scheme: dark)"
        />
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
  let status = 500;
  let title = "Something went wrong";
  let message = "An unexpected error occurred. Please try again in a moment.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    status = error.status;

    if (error.status === 404) {
      title = "Page not found";
      message = "The page you are looking for doesn't exist or has been moved.";
    } else {
      message = error.statusText || message;
    }
  } else if (error instanceof Error && import.meta.env.DEV) {
    message = error.message;
    stack = error.stack;
  }

  return (
    <ErrorPage
      status={status}
      title={title}
      message={message}
      stack={stack}
    />
  );
}
