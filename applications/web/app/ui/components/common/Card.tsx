import { Box, Card as RadixCard } from "@radix-ui/themes";
import type { CardProps } from "./types";

export function Card({ children, className = "", style, variant = "surface" }: CardProps) {
  return (
    <RadixCard variant={variant} className={className} style={style}>
      <Box p="4">{children}</Box>
    </RadixCard>
  );
}
