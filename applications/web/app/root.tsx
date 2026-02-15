import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import type { Route } from "./+types/root";
import { AppTheme } from "./theme/index.jsx";
import { Layout as AppLayout } from "./components/Layout.jsx";
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
    <AppTheme>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </AppTheme>
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
        <Box
          component="main"
          sx={{
            maxWidth: 600,
            mx: "auto",
            py: 4,
            px: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h1" gutterBottom sx={{ color: "primary.main" }}>
            {message}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {details}
          </Typography>
          {stack && (
            <Box
              component="pre"
              sx={{
                p: 2,
                overflow: "auto",
                textAlign: "left",
                bgcolor: "background.paper",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <code>{stack}</code>
            </Box>
          )}
          <Button component={Link} to="/" variant="contained" sx={{ mt: 2 }}>
            Go home
          </Button>
        </Box>
      </AppLayout>
    </AppTheme>
  );
}
