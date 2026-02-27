import * as React from "react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "error" | "info";
  icon?: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className = "", variant = "info", icon, children, ...props }, ref) => {
    const baseStyles = "mt-6 p-4 rounded-lg border";

    const variantStyles = {
      success: "bg-green-50 border-green-200",
      error: "bg-red-50 border-red-200",
      info: "bg-blue-50 border-blue-200",
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {icon ? (
          <div className="flex items-start gap-2">
            {icon}
            <div className="flex-1">{children}</div>
          </div>
        ) : (
          children
        )}
      </div>
    );
  }
);

Alert.displayName = "Alert";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", ...props }, ref) => (
  <p ref={ref} className={`text-sm ${className}`} {...props} />
));

AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription };
