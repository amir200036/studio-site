import { isAllowedImageUrl } from "@/lib/sanitize";

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

const IMAGE_KEY_SET = new Set<string>(IMAGE_CONTENT_KEYS);

/**
 * מסנן מפתחות מותרים. ערכי תמונה נשמרים תמיד מקוצצי-רווחים ומאומתים —
 * ערך עם רווח נלווה נשמר בעבר כמות שהוא, וניקוי ה-Blob (שמשווה ערך מדויק)
 * היה מסמן תמונה בשימוש כמוחלפת ומוחק אותה.
 * `rejected` מחזיק מפתחות תמונה עם URL לא חוקי, כדי שהראוט יחזיר שגיאה
 * במקום "נשמר" שקרי.
 */
export function filterAllowedSiteContent(data: Record<string, string>): {
  data: Record<string, string>;
  rejected: string[];
} {
  const filtered: Record<string, string> = {};
  const rejected: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (!SITE_CONTENT_KEYS.has(key)) continue;
    if (typeof value !== "string") continue;

    if (IMAGE_KEY_SET.has(key)) {
      const url = value.trim();
      if (url && !isAllowedImageUrl(url)) {
        rejected.push(key);
        continue;
      }
      filtered[key] = url;
      continue;
    }

    filtered[key] = value;
  }

  return { data: filtered, rejected };
}
