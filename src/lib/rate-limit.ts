// Rate limiting בזיכרון — מתאים ל-Vercel Edge Functions (per-instance)
// לפרודקשן עם עומס גבוה — להחליף ב-Upstash Redis

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

export function rateLimit(
  ip: string,
  key: string,
  options: RateLimitOptions = { maxRequests: 5, windowMs: 60_000 }
): { allowed: boolean; remaining: number } {
  const id = `${key}:${ip}`;
  const now = Date.now();
  const entry = store.get(id);

  if (!entry || entry.resetAt < now) {
    store.set(id, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.maxRequests - 1 };
  }

  if (entry.count >= options.maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: options.maxRequests - entry.count };
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
