import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { put } from "@vercel/blob";
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
    const filename = `studio-uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(filename, bytes, {
        access: "public",
        contentType: isJpeg ? "image/jpeg" : file.type,
      });
      return NextResponse.json({ url: blob.url });
    }

    // Dev fallback without token: save to public/uploads/
    const dir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(dir, { recursive: true });
    const localName = path.basename(filename);
    await fs.writeFile(path.join(dir, localName), bytes);
    return NextResponse.json({ url: `/uploads/${localName}` });

  } catch (e) {
    console.error("Upload error:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `שגיאה בהעלאה: ${msg}` }, { status: 500 });
  }
}
