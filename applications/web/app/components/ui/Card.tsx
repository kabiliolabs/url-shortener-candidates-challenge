import type { HTMLAttributes, ReactNode, Ref } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  actions?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export function Card({
  title,
  actions,
  className = "",
  children,
  ref,
  ...rest
}: CardProps) {
  return (
    <div ref={ref} className={`card bg-base-100 shadow-md ${className}`} {...rest}>
      <div className="card-body">
        {title && <h2 className="card-title">{title}</h2>}
        {children}
        {actions && <div className="card-actions justify-end">{actions}</div>}
      </div>
    </div>
  );
}
