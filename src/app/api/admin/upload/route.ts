import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import path from "path";
import fs from "fs/promises";

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    if (!ALLOWED.includes(file.type))
      return NextResponse.json(
        { error: `סוג קובץ לא נתמך: "${file.type}". יש להעלות jpg/png/webp בלבד` },
        { status: 400 }
      );

    if (file.size > MAX_BYTES)
      return NextResponse.json({ error: "הקובץ גדול מדי (מקסימום 5MB)" }, { status: 400 });

    const isJpeg = file.type === "image/jpeg" || file.type === "image/jpg";
    const ext = isJpeg ? "jpg" : file.type === "image/png" ? "png" : "webp";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    // Production: use Vercel Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import("@vercel/blob");
        const blob = await put(`studio-uploads/${filename}`, bytes, {
          access: "public",
          contentType: isJpeg ? "image/jpeg" : file.type,
        });
        return NextResponse.json({ url: blob.url });
      } catch (e) {
        console.error("Vercel Blob upload error:", e);
        return NextResponse.json({ error: "שגיאה בהעלאה לאחסון. בדוק שה-BLOB_READ_WRITE_TOKEN תקין." }, { status: 500 });
      }
    }

    // Production without Blob token: fail clearly
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "להעלאת תמונות בסביבת ייצור יש להגדיר Vercel Blob Storage ולהוסיף BLOB_READ_WRITE_TOKEN" },
        { status: 503 }
      );
    }

    // Dev: save to public/uploads/
    try {
      const dir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, filename), bytes);
      return NextResponse.json({ url: `/uploads/${filename}` });
    } catch (e) {
      console.error("Local file write error:", e);
      return NextResponse.json({ error: "שגיאה בשמירת הקובץ לדיסק" }, { status: 500 });
    }
  } catch (e) {
    console.error("Unexpected upload error:", e);
    return NextResponse.json({ error: "שגיאה לא צפויה בשרת" }, { status: 500 });
  }
}
