import crypto from 'node:crypto';
import { ConflictError } from './errors.js';
import { getShortUrlByCode } from './url-repository.js';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 7;
const MAX_RETRIES = 5;

function generateCode(): string {
  const bytes = crypto.randomBytes(CODE_LENGTH);
  let code = '';
  for (const byte of bytes) {
    code += ALPHABET[byte % ALPHABET.length];
  }
  return code;
}

export async function generateUniqueCode(): Promise<string> {
  for (let i = 0; i < MAX_RETRIES; i++) {
    const code = generateCode();
    const existing = await getShortUrlByCode(code);
    if (!existing) return code;
  }
  throw new ConflictError();
}
