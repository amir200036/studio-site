import { prisma } from "@/lib/prisma";
import { deleteBlobUrlIfHosted, isVercelBlobUrl } from "@/lib/blob-storage";
import { IMAGE_CONTENT_KEYS } from "@/lib/site-content-keys";

/**
 * מוחק קובץ מ-Vercel Blob רק אם אף רשומה אחרת לא מפנה אליו.
 * אותה תמונה מספריית הגלריה יכולה לשמש סדנה, אירוע ורקע במקביל
 * (GalleryImagePicker), ולכן מחיקה עיוורת הייתה שוברת תמונות אחרות.
 *
 * יש לקרוא לפונקציה *אחרי* מחיקת הרשומה, כדי שהיא לא תספור את עצמה.
 */
export async function deleteBlobIfUnreferenced(url: string | null | undefined): Promise<void> {
  const target = url?.trim();
  if (!target || !isVercelBlobUrl(target)) return;

  try {
    const [workshops, events, gallery, content] = await Promise.all([
      prisma.workshop.count({ where: { imageUrl: target } }),
      prisma.event.count({ where: { imageUrl: target } }),
      prisma.galleryImage.count({ where: { url: target } }),
      prisma.siteContent.count({
        where: { key: { in: [...IMAGE_CONTENT_KEYS] }, value: target },
      }),
    ]);

    if (workshops + events + gallery + content > 0) return;
  } catch (e) {
    // ספק ההפניות לא נגיש — עדיף להשאיר קובץ יתום מאשר למחוק תמונה בשימוש
    console.error("[blob] reference check failed:", e instanceof Error ? e.message : e);
    return;
  }

  await deleteBlobUrlIfHosted(target);
}

/**
 * מהו-URL-ים של תמונות שהוחלפו בעדכון SiteContent — ערכים קודמים
 * שאינם זהים לערך החדש של אותו מפתח. מוחזרים ללא כפילויות, כי אותה
 * תמונה יכולה לשמש כמה מפתחות רקע במקביל.
 */
export function collectReplacedImageUrls(
  previous: { key: string; value: string }[],
  next: Record<string, string>
): string[] {
  const replaced = new Set<string>();
  for (const row of previous) {
    // מפתח שלא נכלל בעדכון הזה עדיין מחזיק את הערך שלו — אסור להתייחס אליו כמוחלף
    if (!(row.key in next)) continue;
    const old = row.value?.trim();
    if (!old || old === next[row.key]) continue;
    replaced.add(old);
  }
  return Array.from(replaced);
}
