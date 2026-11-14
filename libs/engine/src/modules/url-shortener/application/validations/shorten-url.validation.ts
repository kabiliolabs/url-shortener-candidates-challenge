import { z } from "zod";

export const shortenURLInputSchema = z.string().trim().min(1);
