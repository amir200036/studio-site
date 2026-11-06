import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseEventPatch } from "@/lib/admin-api-validation";
import { requireAdminSession } from "@/lib/require-admin";
import { deleteBlobIfUnreferenced } from "@/lib/blob-cleanup";
import { revalidateSite } from "@/lib/revalidate-site";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { error } = await requireAdminSession();
  if (error) return error;

  const existing = await prisma.event.findUnique({ where: { id: id } });
  if (!existing) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const data = parseEventPatch(body, existing);
  if (!data) return NextResponse.json({ error: "נתוני אירוע לא תקינים" }, { status: 400 });

  const event = await prisma.event.update({ where: { id: id }, data });
  if (existing.imageUrl && existing.imageUrl !== event.imageUrl) {
    await deleteBlobIfUnreferenced(existing.imageUrl);
  }

  revalidateSite();
  return NextResponse.json(event);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const { error } = await requireAdminSession();
  if (error) return error;

  const existing = await prisma.event.findUnique({ where: { id: id } });
  if (!existing) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });

  await prisma.event.delete({ where: { id: id } });
  await deleteBlobIfUnreferenced(existing.imageUrl);

  revalidateSite();
  return NextResponse.json({ success: true });
}
