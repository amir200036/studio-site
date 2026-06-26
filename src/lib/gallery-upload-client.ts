import type { GalleryImage } from "@prisma/client";
import { prepareImageFileForUpload } from "@/lib/prepare-image-file";

export async function uploadImageToGallery(
  file: File,
  order: number
): Promise<{ image?: GalleryImage; error?: string }> {
  let prepared: File;
  try {
    prepared = await prepareImageFileForUpload(file);
  } catch {
    return { error: "לא ניתן לעבד את התמונה. נסו JPG או צילום חדש." };
  }

  const fd = new FormData();
  fd.append("file", prepared);
  const up = await fetch("/api/admin/upload", { method: "POST", body: fd });
  let upData: { url?: string; error?: string };
  try {
    upData = await up.json();
  } catch {
    return { error: `שגיאת שרת (${up.status})` };
  }
  if (!up.ok) return { error: upData.error || "שגיאה בהעלאה" };

  const res = await fetch("/api/admin/gallery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: upData.url, caption: null, order }),
  });
  if (!res.ok) return { error: "ההעלאה הצליחה אך לא נשמרה בספרייה" };
  const image = (await res.json()) as GalleryImage;
  return { image };
}
