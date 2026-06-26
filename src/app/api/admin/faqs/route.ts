import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseFaqInput } from "@/lib/admin-api-validation";
import { requireAdminSession } from "@/lib/require-admin";

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await req.json();
  const data = parseFaqInput(body);
  if (!data) return NextResponse.json({ error: "נתוני שאלה לא תקינים" }, { status: 400 });

  const faq = await prisma.fAQ.create({ data });
  return NextResponse.json(faq);
}
