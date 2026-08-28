import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseReviewInput } from "@/lib/admin-api-validation";
import { requireAdminSession } from "@/lib/require-admin";

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const data = parseReviewInput(body);
  if (!data) return NextResponse.json({ error: "נתוני ביקורת לא תקינים" }, { status: 400 });

  const review = await prisma.review.create({
    data: { ...data, approved: true },
  });
  return NextResponse.json(review);
}
