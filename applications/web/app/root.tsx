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
import { Button } from "~/components/ui/button";
import "./app.css";

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
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;
  // The stack is only shown in development: in production it would expose
  // internals to whoever triggers the error.
  const stack =
    import.meta.env.DEV && error instanceof Error ? error.stack : undefined;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-start justify-center gap-4 px-4 py-12">
      <p className="font-mono text-sm text-muted-foreground">
        {isNotFound ? "404" : "Error"}
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">
        {isNotFound ? "This link doesn't exist" : "Something went wrong"}
      </h1>
      <p className="text-muted-foreground">
        {isNotFound
          ? "The short link may be mistyped, or it was never created."
          : "An unexpected error occurred. Please try again."}
      </p>
      <Button asChild size="lg">
        <Link to="/">Back to home</Link>
      </Button>
      {stack && (
        <pre className="w-full overflow-x-auto rounded-lg border p-4 text-xs">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
