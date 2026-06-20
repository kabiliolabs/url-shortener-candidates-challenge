/** Alphabet used for codes: 0-9, A-Z, a-z (62 symbols, URL-safe). */
const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export interface GenerateShortCodeOptions {
  /** Number of characters in the code. Defaults to 7 (~3.5e12 combinations). */
  length?: number;
  /** Symbol set to draw from. Defaults to {@link BASE62}. */
  alphabet?: string;
  /** Source of randomness; override to make generation deterministic in tests. */
  randomBytes?: (size: number) => Uint8Array;
}

/**
 * Produces `size` cryptographically secure random bytes.
 *
 * This is the production randomness source. It relies on the Web Crypto API
 * (`globalThis.crypto`) rather than `Math.random`, which is not suitable for
 * generating unguessable identifiers.
 *
 * @param size - How many random bytes to return.
 * @returns A `Uint8Array` of length `size` filled with random bytes.
 */
function defaultRandomBytes(size: number): Uint8Array {
  const bytes = new Uint8Array(size);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * Generates a random, URL-safe short code.
 *
 * Each character is chosen uniformly from the alphabet using rejection
 * sampling: any random byte that falls outside the largest multiple of the
 * alphabet length (`max`) is discarded instead of folded with `% length`.
 * Folding the whole 0-255 range would make the first few symbols of the
 * alphabet slightly more likely (modulo bias); rejecting the tail keeps the
 * distribution flat and the codes unguessable.
 *
 * Uniqueness is not guaranteed here by design — the caller persists codes
 * behind a unique constraint and retries on collision.
 *
 * Worked example (base62, so `alphabet.length` is 62):
 * - A random byte ranges 0-255. `max = floor(256 / 62) * 62 = 4 * 62 = 248`.
 * - Byte `100` is in range -> pick `alphabet[100 % 62]` = `alphabet[38]` = "c".
 * - Byte `250` is >= 248 -> reject it and draw another byte, so that the last
 *   8 values (248-255) never bias the result toward the start of the alphabet.
 * - Repeat until we have collected `length` characters.
 *
 * @param options - See {@link GenerateShortCodeOptions}.
 * @returns A string of `options.length` characters from `options.alphabet`.
 *
 * @example
 * ```ts
 * generateShortCode();                 // e.g. "aZ3kPq1" (7 chars, base62)
 * generateShortCode({ length: 4 });    // e.g. "9bQx"
 * ```
 */
export function generateShortCode(options: GenerateShortCodeOptions = {}): string {
  const length = options.length ?? 7;
  const alphabet = options.alphabet ?? BASE62;
  const randomBytes = options.randomBytes ?? defaultRandomBytes;
  const max = Math.floor(256 / alphabet.length) * alphabet.length;

  let code = "";
  while (code.length < length) {
    // Ask only for the bytes still needed; rejected bytes are topped up next loop.
    const bytes = randomBytes(length - code.length);
    for (const byte of bytes) {
      if (byte >= max) continue; // out of range -> reject to avoid modulo bias
      code += alphabet[byte % alphabet.length];
      if (code.length === length) break;
    }
  }
  return code;
}
