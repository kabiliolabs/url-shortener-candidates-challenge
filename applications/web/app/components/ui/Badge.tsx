import type { HTMLAttributes, Ref } from "react";

type BadgeVariant = "primary" | "secondary" | "accent" | "ghost" | "info" | "success" | "warning" | "error";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  ref?: Ref<HTMLSpanElement>;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: "badge-primary",
  secondary: "badge-secondary",
  accent: "badge-accent",
  ghost: "badge-ghost",
  info: "badge-info",
  success: "badge-success",
  warning: "badge-warning",
  error: "badge-error",
};

export function Badge({
  variant = "ghost",
  className = "",
  children,
  ref,
  ...rest
}: BadgeProps) {
  return (
    <span
      ref={ref}
      className={`badge ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
