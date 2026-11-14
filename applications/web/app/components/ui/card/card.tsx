import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "shortener" | "result";
};

export function Card({ variant = "shortener", className, ...props }: CardProps) {
  const cardClassName = variant === "result" ? "result-card" : "shortener-card";

  return (
    <div
      className={className ? `${cardClassName} ${className}` : cardClassName}
      {...props}
    />
  );
}
