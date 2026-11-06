import { NextRequest, NextResponse } from "next/server";
import { del, put } from "@vercel/blob";
import path from "path";
import fs from "fs/promises";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { revalidateSite } from "@/lib/revalidate-site";
import { ImageValidationError, sanitizeUploadedImage } from "@/lib/image-validation";
import { securityLog } from "@/lib/security-log";

/**
 * רושם את הקובץ בספריית התמונות באותה בקשה שבה הוא הועלה.
 * קודם ההעלאה והרישום היו שתי בקשות: אם השנייה נכשלה, הקובץ נשאר
 * באחסון בלי שאף רשומה מפנה אליו — כך נוצרו 21 היתומים.
 * אם הרישום נכשל, מוחקים את הקובץ שזה עתה נכתב כדי לא להשאיר יתום.
 */
async function registerInGallery(url: string, cleanup: () => Promise<void>, correlationId: string) {
  try {
    const order = await prisma.galleryImage.count();
    const image = await prisma.galleryImage.create({
      data: { url, order, showOnHomepage: false },
    });
    revalidateSite();
    return { image, error: null as string | null };
  } catch {
    securityLog("upload_rejected", {
      route: "/api/admin/upload", method: "POST", status: 500,
      environment: process.env.APP_ENVIRONMENT ?? "unknown",
      category: "gallery_registration_failed", correlationId,
    });
    await cleanup().catch(() => undefined);
    return { image: null, error: "התמונה לא נשמרה בספרייה והועלה בוטלה. נסו שוב." };
  }
}

const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const correlationId = crypto.randomUUID();
  const reject = (category: string, status: number, message: string) => {
    securityLog("upload_rejected", {
      route: "/api/admin/upload", method: "POST", status,
      environment: process.env.APP_ENVIRONMENT ?? "unknown",
      category, correlationId,
    });
    return NextResponse.json({ error: message }, { status });
  };

  try {
    const { error } = await requireAdminSession();
    if (error) return error;

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return reject("invalid_form_data", 400, "שגיאה בקריאת הקובץ. נסה שוב.");
    }

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0)
      return reject("missing_file", 400, "לא נבחר קובץ");

    if (file.size > MAX_BYTES)
      return reject("oversized_input", 400, "הקובץ גדול מדי (מקסימום 8MB)");

    let sanitized;
    try {
      sanitized = await sanitizeUploadedImage(Buffer.from(await file.arrayBuffer()));
    } catch (error) {
      if (error instanceof ImageValidationError) {
        return reject(error.category, 400,
          error.category === "oversized_input"
            ? "הקובץ גדול מדי (מקסימום 8MB)"
            : "תמונה לא תקינה. העלו JPG, PNG או WebP תקינים עד 12,000 פיקסלים לכל צד.");
      }
      throw error;
    }

    const filename = `studio-uploads/${crypto.randomUUID()}.${sanitized.ext}`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(filename, sanitized.bytes, {
        access: "public",
        contentType: sanitized.mime,
      });
      const { image, error: dbError } = await registerInGallery(blob.url, () => del(blob.url), correlationId);
      if (dbError) return NextResponse.json({ error: dbError }, { status: 500 });
      return NextResponse.json({ url: blob.url, image });
    }

    // בלי Blob נשארת רק כתיבה לדיסק המקומי. ב-Vercel מערכת הקבצים זמנית,
    // ולכן "הצלחה" כזו בפרודקשן פירושה תמונה שנעלמת בדפלוי הבא — עדיף להיכשל בקול.
    if (process.env.NODE_ENV === "production") {
      return reject("storage_unavailable", 503,
        "אחסון התמונות אינו מוגדר, והתמונה לא נשמרה. פנו למפתח.");
    }

    const dir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(dir, { recursive: true });
    const localName = path.basename(filename);
    const localPath = path.join(dir, localName);
    await fs.writeFile(localPath, sanitized.bytes);

    const localUrl = `/uploads/${localName}`;
    const { image, error: dbError } = await registerInGallery(localUrl, () => fs.unlink(localPath), correlationId);
    if (dbError) return NextResponse.json({ error: dbError }, { status: 500 });
    return NextResponse.json({ url: localUrl, image });
  } catch {
    securityLog("upload_rejected", {
      route: "/api/admin/upload", method: "POST", status: 500,
      environment: process.env.APP_ENVIRONMENT ?? "unknown",
      category: "internal_error", correlationId,
    });
    return NextResponse.json({ error: "שגיאה בהעלאה. נסו שוב." }, { status: 500 });
  }
}
