type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimitOrThrow(ip: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const current = buckets.get(ip);

  if (!current || current.resetAt <= now) {
    buckets.set(ip, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (current.count >= limit) {
    const secs = Math.ceil((current.resetAt - now) / 1000);
    throw new Response(`Too many requests. Try again in ${secs}s.`, {
      status: 429,
    });
  }

  current.count += 1;
  buckets.set(ip, current);
}

export function getClientIp(request: Request) {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
