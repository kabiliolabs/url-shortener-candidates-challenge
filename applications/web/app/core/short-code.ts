// Unambiguous alphanumeric characters (no 0/O, 1/l/I)
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"

export const CODE_LENGTH = 7
export const MAX_ATTEMPTS = 5

export function generateCode(): string {
  let code = ""
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return code
}

export function isValidCode(code: string): boolean {
  return typeof code === "string" && code.length === CODE_LENGTH && /^[A-Za-z0-9]+$/.test(code)
}
