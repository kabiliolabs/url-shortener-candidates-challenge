export const shortenedUrls: Map<string, string> = new Map();

export function generateShortCode(): string {
  const chars = "abc";
  const length = 2;
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
