import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { ButtonLink } from "./components/button";
import { FeedbackMessage } from "./components/feedback-message";
import { PageLayout } from "./components/page-layout";
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

/** Estructura HTML compartida por las rutas de la aplicación. */
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

/** Punto de entrada de la interfaz; muestra la ruta activa. */
export default function App() {
  return <Outlet />;
}

/** Presenta errores de ruta con un mensaje seguro y detalles. */
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
    <PageLayout
      title={message}
      description="We could not complete your request."
    >
      <FeedbackMessage tone="error">{details}</FeedbackMessage>
      {stack && (
        <pre className="mt-6 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
          <code>{stack}</code>
        </pre>
      )}
      <ButtonLink to="/" className="mt-6">
        Return to home
      </ButtonLink>
    </PageLayout>
  );
}
