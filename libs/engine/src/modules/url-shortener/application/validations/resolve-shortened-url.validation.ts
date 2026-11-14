import { z } from "zod";

export const resolveShortenedURLInputSchema = z
  .string()
  .refine((value) => value.trim().length > 0);
