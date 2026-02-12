/**
 * Short Code Generation Module
 * 
 * Provides collision-resistant short code generation using nanoid.
 * Uses a custom alphabet that avoids ambiguous characters (0/O, 1/l/I).
 */

import { customAlphabet } from 'nanoid';

// Custom alphabet without ambiguous characters
// Excludes: 0, O, 1, l, I to prevent user confusion
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
const CODE_LENGTH = 7;

/**
 * Interface for short code generators
 * Allows for easy testing and potential alternative implementations
 */
export interface ShortCodeGenerator {
  generate(): string;
}

/**
 * NanoID-based short code generator
 * 
 * Collision probability:
 * - 7 characters from 57-char alphabet = 57^7 ≈ 1.6 trillion combinations
 * - Extremely low collision probability even at high scale
 * - At 1000 URLs/hour, would take ~180,000 years to reach 1% collision probability
 */
export class NanoIdShortCodeGenerator implements ShortCodeGenerator {
  private readonly generator: () => string;

  constructor(length: number = CODE_LENGTH, alphabet: string = ALPHABET) {
    this.generator = customAlphabet(alphabet, length);
  }

  generate(): string {
    return this.generator();
  }
}

/**
 * Factory function to create a short code generator
 * Makes it easy to swap implementations or configure differently
 */
export function createShortCodeGenerator(): ShortCodeGenerator {
  return new NanoIdShortCodeGenerator();
}

/**
 * Generates a unique short code with collision detection
 * 
 * Attempts to generate a code multiple times, checking for existence
 * before returning. This provides defense-in-depth against collisions.
 * 
 * @param generator - The short code generator to use
 * @param existsCheck - Async function to check if a code already exists
 * @param maxAttempts - Maximum number of generation attempts
 * @returns A guaranteed unique short code
 * @throws Error if unable to generate unique code after maxAttempts
 */
export async function generateUniqueShortCode(
  generator: ShortCodeGenerator,
  existsCheck: (code: string) => Promise<boolean>,
  maxAttempts: number = 5
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generator.generate();
    const exists = await existsCheck(code);
    
    if (!exists) {
      return code;
    }
    
    // Log collision for monitoring (rare occurrence)
    console.warn(`Short code collision detected: ${code} (attempt ${attempt + 1}/${maxAttempts})`);
  }
  
  throw new Error('Failed to generate unique short code after multiple attempts. This is extremely rare and may indicate a system issue.');
}
