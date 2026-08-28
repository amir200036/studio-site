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
    // ניקוי רשומות שפגו — אחרת ה-Map גדל בלי גבול לפי IP (שניתן לזייף)
    if (store.size > 5_000) {
      for (const [k, v] of Array.from(store.entries())) if (v.resetAt < now) store.delete(k);
    }
    store.set(id, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.maxRequests - 1 };
  }

  if (entry.count >= options.maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: options.maxRequests - entry.count };
}

/**
 * ה-IP של הלקוח. `x-real-ip` נכתב ע"י ה-proxy ולכן עדיף.
 * ב-`x-forwarded-for` הערך השמאלי מגיע מהלקוח וניתן לזיוף — הערך הימני
 * הוא זה שה-proxy הקרוב הוסיף, ולכן הוא הבחירה הבטוחה מבין השניים.
 */
export function getClientIp(req: Request): string {
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }

  return "unknown";
}
