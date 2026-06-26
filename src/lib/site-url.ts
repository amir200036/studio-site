/**
 * כתובת האתר המלאה (https://…) לקנוניקל, OG, sitemap, JSON-LD, robots, llms.txt.
 * סדר עדיפות:
 * 1. NEXT_PUBLIC_SITE_URL (מומלץ — דומיין קבוע)
 * 2. VERCEL_PROJECT_PRODUCTION_URL (דומיין production ב-Vercel)
 * 3. VERCEL_URL (deploy נוכחי — fallback)
 * 4. localhost
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  if (production) return `https://${production}`;

  const vercel = process.env.VERCEL_URL?.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}
