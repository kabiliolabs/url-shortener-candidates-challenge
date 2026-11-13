import type { ButtonHTMLAttributes } from "react";
import { Link } from "react-router";
import type { LinkProps } from "react-router";

type ButtonVariant = "primary" | "secondary";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-cyan-300 text-slate-950 hover:bg-cyan-200 focus-visible:ring-cyan-300",
  secondary:
    "border border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800 focus-visible:ring-slate-400",
};

const buttonBaseClasses =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-3 text-center font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Estilo visual del botón. */
  variant?: ButtonVariant;
  /** Deshabilita el botón y muestra el estado de carga. */
  loading?: boolean;
  /** Texto alternativo mientras se realiza la operación. */
  loadingLabel?: string;
}

/** Botón reutilizable con variantes visuales y estado accesible de carga. */
export function Button({
  variant = "primary",
  loading = false,
  loadingLabel,
  disabled,
  type = "button",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${buttonBaseClasses} ${buttonVariants[variant]} ${className}`}
    >
      {loading ? (
        <span role="status" aria-live="polite" className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          />
          {loadingLabel ?? children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

interface ButtonLinkProps extends Omit<LinkProps, "className"> {
  /** Estilo visual del enlace presentado como botón. */
  variant?: ButtonVariant;
  /** Clases adicionales para ajustar el diseño en el punto de uso. */
  className?: string;
}

/** Enlace de React Router con la apariencia compartida de un botón. */
export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      {...props}
      className={`${buttonBaseClasses} ${buttonVariants[variant]} ${className}`}
    />
  );
}
