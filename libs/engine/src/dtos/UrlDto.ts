import { z } from 'zod';

export const createUrlSchema = z.object({
  url: z.string().url('Please enter a valid URL.'),
});

export type CreateUrlDto = z.infer<typeof createUrlSchema>;

export interface UrlDto {
  id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: string; // ISO string representation
}
