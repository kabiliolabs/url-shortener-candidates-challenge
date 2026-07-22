import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  leadingIcon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-black text-white shadow-lg shadow-black/25 hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500 disabled:shadow-none",
  secondary:
    "bg-white text-black ring-1 ring-black/10 shadow-sm hover:bg-neutral-100 disabled:text-neutral-400",
  ghost:
    "bg-transparent text-neutral-700 hover:bg-black/5 disabled:text-neutral-400",
};

export function Button({
  className,
  children,
  variant = "primary",
  leadingIcon,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed",
        variants[variant],
        className,
      )}
      {...props}
    >
      {leadingIcon}
      {children}
    </button>
  );
}