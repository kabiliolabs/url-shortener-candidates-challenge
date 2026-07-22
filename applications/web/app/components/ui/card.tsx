import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title?: string;
  description?: string;
  headerAction?: ReactNode;
}

export function Card({
  className,
  eyebrow,
  title,
  description,
  headerAction,
  children,
  ...props
}: CardProps) {
  return (
    <section
      className={cn(
        "rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_28px_90px_-40px_rgba(0,0,0,0.18)] backdrop-blur",
        className,
      )}
      {...props}
    >
      {(eyebrow || title || description || headerAction) && (
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                {eyebrow}
              </p>
            )}
            {title && <h2 className="mt-2 text-xl font-semibold text-black">{title}</h2>}
            {description && <p className="mt-2 text-sm leading-6 text-neutral-600">{description}</p>}
          </div>
          {headerAction}
        </header>
      )}
      {children}
    </section>
  );
}