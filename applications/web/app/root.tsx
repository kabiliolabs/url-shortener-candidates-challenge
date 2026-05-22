import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { Toaster } from "sonner";
import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  // Manrope mirrors the Aeonik vibe Kabilio uses — geometric, friendly,
  // optical-sized; Geist Mono pairs with it for the code chips.
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Geist+Mono:wght@400;500&display=swap",
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
        {/*
         * Theme tuned to match kabilio.es exactly:
         * - accent="indigo" hits #6366f1 (Radix indigo-9)
         * - gray="sand" gives a warm cream/sand neutral; app.css further
         *   pins --gray-1 to the exact Kabilio cream (#f3f0ec)
         * - radius="full" matches the pill-shaped buttons across the site
         * - scaling="105%" gives the airy, premium feel Kabilio uses
         */}
        <Theme
          accentColor="indigo"
          grayColor="sand"
          radius="full"
          scaling="105%"
          appearance="light"
          panelBackground="solid"
        >
          {children}
          <Toaster richColors closeButton theme="light" position="bottom-right" />
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
    <main className="container mx-auto p-6 pt-16">
      <h1 className="text-3xl font-semibold">{message}</h1>
      <p className="mt-2 text-gray-600">{details}</p>
      {stack && (
        <pre className="mt-6 w-full overflow-x-auto rounded-lg bg-gray-100 p-4 text-sm">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
