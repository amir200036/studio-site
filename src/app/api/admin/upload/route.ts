import { NextRequest, NextResponse } from "next/server";
import { del, put } from "@vercel/blob";
import path from "path";
import fs from "fs/promises";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { revalidateSite } from "@/lib/revalidate-site";

/**
 * רושם את הקובץ בספריית התמונות באותה בקשה שבה הוא הועלה.
 * קודם ההעלאה והרישום היו שתי בקשות: אם השנייה נכשלה, הקובץ נשאר
 * באחסון בלי שאף רשומה מפנה אליו — כך נוצרו 21 היתומים.
 * אם הרישום נכשל, מוחקים את הקובץ שזה עתה נכתב כדי לא להשאיר יתום.
 */
async function registerInGallery(url: string, cleanup: () => Promise<void>) {
  try {
    const order = await prisma.galleryImage.count();
    const image = await prisma.galleryImage.create({
      data: { url, order, showOnHomepage: false },
    });
    revalidateSite();
    return { image, error: null as string | null };
  } catch (e) {
    console.error("[upload] gallery insert failed, rolling back:", e instanceof Error ? e.message : e);
    await cleanup().catch(() => undefined);
    return { image: null, error: "התמונה לא נשמרה בספרייה והועלה בוטלה. נסו שוב." };
  }
}

const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const MAX_BYTES = 8 * 1024 * 1024;

function resolveImageMeta(file: File): { mime: string; ext: string } | null {
  const name = file.name.toLowerCase();
  let mime = file.type?.toLowerCase() || "";

  if (!mime || mime === "application/octet-stream") {
    if (name.endsWith(".jpg") || name.endsWith(".jpeg")) mime = "image/jpeg";
    else if (name.endsWith(".png")) mime = "image/png";
    else if (name.endsWith(".webp")) mime = "image/webp";
  }

  if (!ALLOWED_MIME.has(mime)) return null;

  const ext =
    mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  return { mime: mime === "image/jpg" ? "image/jpeg" : mime, ext };
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (e) {
      console.error("formData parse error:", e);
      return NextResponse.json({ error: "שגיאה בקריאת הקובץ. נסה שוב." }, { status: 400 });
    }

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0)
      return NextResponse.json({ error: "לא נבחר קובץ" }, { status: 400 });

    const meta = resolveImageMeta(file);
    if (!meta)
      return NextResponse.json(
        {
          error:
            'סוג קובץ לא נתמך. העלו JPG, PNG או WebP (באייפון — "מהגלריה" או "צלם תמונה" באדמין).',
        },
        { status: 400 }
      );

    if (file.size > MAX_BYTES)
      return NextResponse.json({ error: "הקובץ גדול מדי (מקסימום 8MB)" }, { status: 400 });

    const filename = `studio-uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${meta.ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(filename, bytes, {
        access: "public",
        contentType: meta.mime,
      });
      const { image, error: dbError } = await registerInGallery(blob.url, () => del(blob.url));
      if (dbError) return NextResponse.json({ error: dbError }, { status: 500 });
      return NextResponse.json({ url: blob.url, image });
    }

    // בלי Blob נשארת רק כתיבה לדיסק המקומי. ב-Vercel מערכת הקבצים זמנית,
    // ולכן "הצלחה" כזו בפרודקשן פירושה תמונה שנעלמת בדפלוי הבא — עדיף להיכשל בקול.
    if (process.env.NODE_ENV === "production") {
      console.error("BLOB_READ_WRITE_TOKEN חסר — ההעלאה נחסמה כדי שהתמונה לא תיעלם בדפלוי הבא");
      return NextResponse.json(
        { error: "אחסון התמונות אינו מוגדר, והתמונה לא נשמרה. פנו למפתח." },
        { status: 503 }
      );
    }

    const dir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(dir, { recursive: true });
    const localName = path.basename(filename);
    const localPath = path.join(dir, localName);
    await fs.writeFile(localPath, bytes);

    const localUrl = `/uploads/${localName}`;
    const { image, error: dbError } = await registerInGallery(localUrl, () => fs.unlink(localPath));
    if (dbError) return NextResponse.json({ error: dbError }, { status: 500 });
    return NextResponse.json({ url: localUrl, image });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "שגיאה בהעלאה. נסו שוב." }, { status: 500 });
  }
}
