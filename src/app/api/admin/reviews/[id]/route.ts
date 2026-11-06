import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseReviewPatch } from "@/lib/admin-api-validation";
import { requireAdminSession } from "@/lib/require-admin";
import { revalidateSite } from "@/lib/revalidate-site";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await req.json().catch(() => null);

  const existing = await prisma.review.findUnique({ where: { id: id } });
  if (!existing) return NextResponse.json({ error: "לא נמצאה" }, { status: 404 });

  const data = parseReviewPatch(body, existing);
  if (!data) return NextResponse.json({ error: "נתוני ביקורת לא תקינים" }, { status: 400 });

  const review = await prisma.review.update({ where: { id: id }, data });
  revalidateSite();
  return NextResponse.json(review);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const { error } = await requireAdminSession();
  if (error) return error;

  await prisma.review.delete({ where: { id: id } });
  revalidateSite();
  return NextResponse.json({ success: true });
}
