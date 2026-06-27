import { ValidationError } from './errors.js';

const MAX_URL_LENGTH = 2048;

export function validateUrl(input: string): string {
  const trimmed = input.trim();

  if (!trimmed) throw new ValidationError('URL is required');
  if (trimmed.length > MAX_URL_LENGTH) throw new ValidationError(`URL must be ${MAX_URL_LENGTH} characters or fewer`);

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new ValidationError('URL is not valid');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new ValidationError('URL must use http or https');
  }

  return trimmed;
}
