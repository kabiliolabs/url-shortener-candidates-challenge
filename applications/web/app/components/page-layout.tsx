import type { ReactNode } from "react";
import { Link } from "react-router";

interface PageLayoutProps {
  /** Acción opcional que aparece en el encabezado, por ejemplo, un enlace. */
  action?: ReactNode;
  children: ReactNode;
  description?: string;
  /** Ancho máximo del contenido principal. */
  maxWidth?: "3xl" | "6xl";
  title: string;
}

const maxWidthClasses = {
  "3xl": "max-w-3xl",
  "6xl": "max-w-6xl",
};

/** Estructura común de página con encabezado, descripción y acción opcional. */
export function PageLayout({
  action,
  children,
  description,
  maxWidth = "3xl",
  title,
}: PageLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-8">
      <div className={`mx-auto ${maxWidthClasses[maxWidth]}`}>
        <header className="mb-8 flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <Link
              to="/"
              className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300 transition hover:text-cyan-200"
            >
              Kabilio technical test - Jeyson Garcia
            </Link>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-2xl text-slate-300">{description}</p>
            )}
          </div>
          {action}
        </header>
        {children}
      </div>
    </main>
  );
}
