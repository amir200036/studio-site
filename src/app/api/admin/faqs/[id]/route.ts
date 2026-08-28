import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseFaqPatch } from "@/lib/admin-api-validation";
import { requireAdminSession } from "@/lib/require-admin";
import { revalidateSite } from "@/lib/revalidate-site";

interface Params { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await req.json().catch(() => null);

  const existing = await prisma.fAQ.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });

  const data = parseFaqPatch(body, existing);
  if (!data) return NextResponse.json({ error: "נתוני שאלה לא תקינים" }, { status: 400 });

  const faq = await prisma.fAQ.update({ where: { id: params.id }, data });
  revalidateSite();
  return NextResponse.json(faq);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  await prisma.fAQ.delete({ where: { id: params.id } });
  revalidateSite();
  return NextResponse.json({ success: true });
}
