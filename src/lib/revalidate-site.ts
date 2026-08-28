import { revalidatePath } from "next/cache";

/**
 * מרענן את כל הדפים הציבוריים אחרי שינוי תוכן באדמין.
 * הדפים נשמרים ב-CDN (`export const revalidate`), ובלי הקריאה הזו שינוי
 * היה מופיע רק אחרי שפג התוקף.
 */
export function revalidateSite(): void {
  try {
    revalidatePath("/", "layout");
  } catch (e) {
    // כישלון ריענון לא אמור להפיל שמירה שכבר הצליחה
    console.error("[revalidate]", e instanceof Error ? e.message : e);
  }
}
