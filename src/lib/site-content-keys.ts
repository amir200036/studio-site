/** מפתחות SiteContent שהערך שלהם הוא URL של תמונה — משמשים גם לניקוי קבצים יתומים */
export const IMAGE_CONTENT_KEYS = [
  "about_image",
  "bg_image_home",
  "bg_image_workshops",
  "bg_image_events",
  "bg_image_faq",
  "bg_image_contact",
] as const;

/** מפתחות SiteContent מותרים לעדכון דרך /api/admin/content */
export const SITE_CONTENT_KEYS = new Set<string>([
  "hero_title",
  "hero_subtitle",
  "hero_cta",
  "hero_text_color",
  "about_title",
  "about_text",
  "stat_years",
  "stat_students",
  "stat_workshops",
  "hours",
  "terms_content",
  "global_bg_color",
  ...IMAGE_CONTENT_KEYS,
]);

export function filterAllowedSiteContent(data: Record<string, string>): Record<string, string> {
  const filtered: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (!SITE_CONTENT_KEYS.has(key)) continue;
    if (typeof value !== "string") continue;
    filtered[key] = value;
  }
  return filtered;
}
