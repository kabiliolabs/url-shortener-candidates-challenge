import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import Button from "@mui/material/Button";

import type { Route } from "./+types/root";
import { queryClient } from "./query-client.js";
import { AppTheme } from "./theme/index.jsx";
import { Layout as AppLayout } from "./components/Layout/index.js";
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
    href: "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap",
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
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <AppTheme>
          <AppLayout>
            <Outlet />
          </AppLayout>
        </AppTheme>
      </JotaiProvider>
    </QueryClientProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <AppTheme>
      <AppLayout>
        <main className="mx-auto max-w-[600px] px-4 py-10 text-center">
          <h1 className="mb-4 text-4xl font-bold text-primary">{message}</h1>
          <p className="mb-6 text-text-secondary">{details}</p>
          {stack && (
            <pre className="overflow-auto rounded-lg border border-[var(--color-border)] bg-background-paper p-4 text-left">
              <code>{stack}</code>
            </pre>
          )}
          <Button component={Link} to="/" variant="contained" className="mt-6">
            Go home
          </Button>
        </main>
      </AppLayout>
    </AppTheme>
  );
}
