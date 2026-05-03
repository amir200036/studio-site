/**
 * כתובת האתר המלאה (https://…) לקנוניקל, OG, sitemap, JSON-LD.
 * סדר עדיפות: NEXT_PUBLIC_SITE_URL → VERCEL_URL → localhost
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_URL?.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
