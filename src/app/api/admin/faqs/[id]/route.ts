import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseFaqInput } from "@/lib/admin-api-validation";
import { requireAdminSession } from "@/lib/require-admin";

interface Params { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await req.json();
  const data = parseFaqInput(body);
  if (!data) return NextResponse.json({ error: "נתוני שאלה לא תקינים" }, { status: 400 });

  const faq = await prisma.fAQ.update({ where: { id: params.id }, data });
  return NextResponse.json(faq);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  await prisma.fAQ.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
