import { Box, Card as RadixCard } from "@radix-ui/themes";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "surface" | "classic" | "ghost";
}

export function Card({ children, className = "", variant = "surface" }: CardProps) {
  return (
    <RadixCard variant={variant} className={className}>
      <Box p="4">{children}</Box>
    </RadixCard>
  );
}
