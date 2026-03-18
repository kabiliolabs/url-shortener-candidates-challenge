export const shortenedUrls: Map<string, string> = new Map();

export function generateShortCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const length = 7;
  let code: string;
  do {
    code = "";
    for (let i = 0; i < length; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  } while (shortenedUrls.has(code));
  return code;
}
