import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteBlobUrlIfHosted } from "@/lib/blob-storage";
import { requireAdminSession } from "@/lib/require-admin";

interface Params { params: { id: string } }

function parseGalleryPatch(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const data: { caption?: string | null; order?: number; showOnHomepage?: boolean } = {};

  if ("caption" in b) {
    data.caption = typeof b.caption === "string" ? b.caption.slice(0, 200) : null;
  }
  if ("order" in b && typeof b.order === "number" && Number.isFinite(b.order)) {
    data.order = Math.max(0, Math.floor(b.order));
  }
  if ("showOnHomepage" in b && typeof b.showOnHomepage === "boolean") {
    data.showOnHomepage = b.showOnHomepage;
  }

  return Object.keys(data).length > 0 ? data : null;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await req.json();
  const data = parseGalleryPatch(body);
  if (!data) {
    return NextResponse.json({ error: "אין שדות תקינים לעדכון" }, { status: 400 });
  }

  const img = await prisma.galleryImage.update({ where: { id: params.id }, data });
  return NextResponse.json(img);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const existing = await prisma.galleryImage.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });

  await prisma.galleryImage.delete({ where: { id: params.id } });
  await deleteBlobUrlIfHosted(existing.url);

  return NextResponse.json({ success: true });
}
