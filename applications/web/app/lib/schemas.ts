import { z } from "zod"

export const shortenFormSchema = z.object({
  url: z.string().min(1, "Please enter a URL").url("Please enter a valid URL (starting with http:// or https://)"),
})

export type ShortenFormSchema = z.infer<typeof shortenFormSchema>
