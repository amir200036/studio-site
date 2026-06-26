import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function parseGalleryCreate(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.url !== "string" || !b.url.trim()) return null;
  const url = b.url.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("/uploads/")) {
    return null;
  }
  return {
    url,
    caption: typeof b.caption === "string" ? b.caption.slice(0, 200) : null,
    order: typeof b.order === "number" && Number.isFinite(b.order) ? Math.max(0, Math.floor(b.order)) : 0,
    showOnHomepage: b.showOnHomepage === true,
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const images = await prisma.galleryImage.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(images);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = parseGalleryCreate(body);
  if (!data) {
    return NextResponse.json({ error: "נתוני תמונה לא תקינים" }, { status: 400 });
  }

  const img = await prisma.galleryImage.create({ data });
  return NextResponse.json(img);
}
