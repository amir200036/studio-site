import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseEventInput } from "@/lib/admin-api-validation";
import { requireAdminSession } from "@/lib/require-admin";

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await req.json();
  const data = parseEventInput(body);
  if (!data) return NextResponse.json({ error: "נתוני אירוע לא תקינים" }, { status: 400 });

  const event = await prisma.event.create({ data });
  return NextResponse.json(event);
}
