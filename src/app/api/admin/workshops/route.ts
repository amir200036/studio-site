import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseWorkshopInput } from "@/lib/admin-api-validation";
import { requireAdminSession } from "@/lib/require-admin";
import { revalidateSite } from "@/lib/revalidate-site";

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const data = parseWorkshopInput(body);
  if (!data) return NextResponse.json({ error: "נתוני סדנה לא תקינים" }, { status: 400 });

  const workshop = await prisma.workshop.create({ data });
  revalidateSite();
  return NextResponse.json(workshop);
}
