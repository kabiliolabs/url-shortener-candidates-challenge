import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { Theme } from "@radix-ui/themes";

import type { Route } from "./+types/root";
import { ErrorPage } from "~/ui";
import "@radix-ui/themes/styles.css";
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
        <Theme accentColor="teal" grayColor="slate" radius="medium" scaling="100%">
          {children}
        </Theme>
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
  let statusCode = 500;
  let title = "Oops!";
  let message = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    if (error.status === 404) {
      title = "Page Not Found";
      message = "The page you're looking for doesn't exist or the short URL is invalid.";
    } else {
      title = `Error ${error.status}`;
      message = error.statusText || message;
    }
  } else if (error && error instanceof Error) {
    // Check for database errors
    if (error.name === "DatabaseError") {
      title = "Database Setup Required";
      message = error.message;
      statusCode = 503; // Service Unavailable
    } else if (import.meta.env.DEV) {
      message = error.message;
      //stack = error.stack;
    }
  }

  return (
    <ErrorPage
      statusCode={statusCode}
      title={title}
      message={message}
      stack={stack}
    />
  );
}
