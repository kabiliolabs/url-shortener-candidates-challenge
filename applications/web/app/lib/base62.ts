const ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function toBase62(n: number): string {
  if (!Number.isFinite(n) || n <= 0) throw new Error("Invalid id for base62");
  let num = n;
  let out = "";
  while (num > 0) {
    out = ALPHABET[num % 62] + out;
    num = Math.floor(num / 62);
  }
  return out;
}
