import { Link as LinkIcon } from "lucide-react";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { buttonVariants } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/root";
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
      <body className="min-h-screen bg-muted/40">
        <Header />
        <main className="mx-auto w-full max-w-4xl px-4 py-10">{children}</main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function Header() {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(buttonVariants({ variant: "ghost", size: "sm" }), isActive && "bg-muted text-foreground");

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <LinkIcon className="size-5" aria-hidden />
          URL Shortener
        </Link>
        <nav className="flex gap-1">
          <NavLink to="/" end className={navClass}>
            Shorten
          </NavLink>
          <NavLink to="/stats" className={navClass}>
            Stats
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let title = "Something went wrong";
  let details = "An unexpected error occurred. Please try again in a moment.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    title = error.status === 404 ? "Page not found" : `Error ${error.status}`;
    details =
      typeof error.data === "string" && error.data
        ? error.data
        : "The page you're looking for doesn't exist.";
  } else if (import.meta.env.DEV && error instanceof Error) {
    // Only in dev: in production we never leak internals to the user (SPEC-008).
    details = error.message;
    stack = error.stack;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{details}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {stack ? (
          <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs">
            <code>{stack}</code>
          </pre>
        ) : null}
        <Link to="/" className={cn(buttonVariants(), "self-start")}>
          Back to home
        </Link>
      </CardContent>
    </Card>
  );
}
