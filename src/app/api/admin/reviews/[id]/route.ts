import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseReviewInput } from "@/lib/admin-api-validation";
import { requireAdminSession } from "@/lib/require-admin";

interface Params { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await req.json();
  const data = parseReviewInput(body);
  if (!data) return NextResponse.json({ error: "נתוני ביקורת לא תקינים" }, { status: 400 });

  const review = await prisma.review.update({ where: { id: params.id }, data });
  return NextResponse.json(review);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  await prisma.review.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
