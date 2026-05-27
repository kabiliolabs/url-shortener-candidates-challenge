import type { ComponentPropsWithoutRef } from "react";

type CalloutVariant = "error" | "success" | "info";

interface CalloutProps extends ComponentPropsWithoutRef<"div"> {
  variant?: CalloutVariant;
}

const variantClassNames: Record<CalloutVariant, string> = {
  error: "border-red-200 bg-red-50 text-red-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  info: "border-sky-200 bg-sky-50 text-sky-950",
};

export function Callout({
  children,
  className,
  variant = "info",
  ...props
}: CalloutProps) {
  return (
    <div
      className={[
        "rounded-lg border px-4 py-3 text-sm",
        variantClassNames[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role={variant === "error" ? "alert" : "status"}
      {...props}
    >
      {children}
    </div>
  );
}
