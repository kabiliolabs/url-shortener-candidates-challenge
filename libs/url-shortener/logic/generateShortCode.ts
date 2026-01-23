const CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const LENGTH = 6;

/**
 * Generates a random short code
 */
export function generateShortCode(): string {
  let code = "";
  for (let i = 0; i < LENGTH; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

/**
 * Validates if a string is a valid short code
 */
export function isValidShortCode(value: string): boolean {
  if (value.length !== LENGTH) {
    return false;
  }
  return [...value].every((char) => CHARS.includes(char));
}
