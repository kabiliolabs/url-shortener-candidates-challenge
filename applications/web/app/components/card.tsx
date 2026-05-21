import { Box } from "@radix-ui/themes";
import type { ComponentPropsWithoutRef, CSSProperties } from "react";

type CardVariant = "premium" | "highlight";

type CardProps = ComponentPropsWithoutRef<typeof Box> & {
  variant?: CardVariant;
};

const variantStyles: Record<CardVariant, CSSProperties> = {
  premium: {
    background: "#ffffff",
    borderRadius: 24,
    border: "1px solid rgba(17, 24, 39, 0.06)",
    boxShadow:
      "0 1px 0 rgba(17, 24, 39, 0.02), 0 12px 32px -16px rgba(17, 24, 39, 0.12)",
  },
  highlight: {
    background:
      "linear-gradient(135deg, var(--pastel-lavender-soft) 0%, #ffffff 60%)",
    borderRadius: 24,
    border: "1px solid rgba(99, 102, 241, 0.18)",
  },
};

export function Card({ variant = "premium", style, ...rest }: CardProps) {
  return <Box style={{ ...variantStyles[variant], ...style }} {...rest} />;
}
