import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseWorkshopInput } from "@/lib/admin-api-validation";
import { requireAdminSession } from "@/lib/require-admin";

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await req.json();
  const data = parseWorkshopInput(body);
  if (!data) return NextResponse.json({ error: "נתוני סדנה לא תקינים" }, { status: 400 });

  const workshop = await prisma.workshop.create({ data });
  return NextResponse.json(workshop);
}
