import type { HTMLAttributes, Ref } from "react";

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  ref?: Ref<HTMLDivElement>;
}

const variantClasses: Record<AlertVariant, string> = {
  info: "alert-info",
  success: "alert-success",
  warning: "alert-warning",
  error: "alert-error",
};

export function Alert({
  variant = "info",
  className = "",
  children,
  ref,
  ...rest
}: AlertProps) {
  return (
    <div
      ref={ref}
      role="alert"
      className={`alert ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
