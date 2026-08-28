import type { GalleryImage } from "@prisma/client";
import { prepareImageFileForUpload } from "@/lib/prepare-image-file";

/**
 * העלאה אחת. /api/admin/upload כותב לאחסון *ורושם בספרייה* באותה בקשה,
 * ומגלגל אחורה את הקובץ אם הרישום נכשל — כך שלא נוצר קובץ יתום.
 * הפרמטר order לא נדרש יותר; השרת קובע אותו.
 */
export async function uploadImageToGallery(
  file: File
): Promise<{ image?: GalleryImage; error?: string }> {
  let prepared: File;
  try {
    prepared = await prepareImageFileForUpload(file);
  } catch {
    return { error: "לא ניתן לעבד את התמונה. נסו JPG או צילום חדש." };
  }

  const fd = new FormData();
  fd.append("file", prepared);

  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  let data: { url?: string; image?: GalleryImage; error?: string };
  try {
    data = await res.json();
  } catch {
    return { error: `שגיאת שרת (${res.status})` };
  }

  if (!res.ok) return { error: data.error || "שגיאה בהעלאה" };
  if (!data.image) return { error: "התמונה הועלתה אך לא נרשמה בספרייה" };
  return { image: data.image };
}
