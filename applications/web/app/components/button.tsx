import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "default" | "sm";

const base =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60";

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-11 px-5 text-sm",
  sm: "h-8 px-3 text-xs",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-sun-400 text-slate-900 shadow-[0_10px_24px_-12px_rgba(245,181,1,0.95)] hover:bg-sun-400 active:bg-sun-500 active:shadow-none",
  secondary:
    "border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 active:bg-brand-100",
  ghost: "text-slate-600 hover:bg-brand-50 hover:text-brand-700",
};

export function buttonClassName(
  variant: ButtonVariant = "primary",
  className?: string,
  size: ButtonSize = "default",
): string {
  return cn(base, sizeClasses[size], variantClasses[variant], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "default", className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClassName(variant, className, size)}
      {...props}
    />
  );
});
