import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center min-w-[3rem] px-3 py-1 rounded-full text-sm font-semibold";

    const variantStyles = {
      default: "bg-indigo-100 text-indigo-700",
      secondary: "bg-slate-100 text-slate-700",
      success: "bg-green-100 text-green-700",
      warning: "bg-amber-100 text-amber-700",
    };

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
