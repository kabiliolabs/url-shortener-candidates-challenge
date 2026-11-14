import type { HTMLAttributes, ReactNode } from "react";

type InlineErrorProps = HTMLAttributes<HTMLDivElement> & {
  message: ReactNode;
};

export function InlineError({ message, className, ...props }: InlineErrorProps) {
  return (
    <div
      className={className ? `form-error ${className}` : "form-error"}
      {...props}
    >
      <p>{message}</p>
    </div>
  );
}
