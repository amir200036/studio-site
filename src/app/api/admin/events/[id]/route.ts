import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseEventPatch } from "@/lib/admin-api-validation";
import { requireAdminSession } from "@/lib/require-admin";

interface Params { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const existing = await prisma.event.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });

  const body = await req.json();
  const data = parseEventPatch(body, existing);
  if (!data) return NextResponse.json({ error: "נתוני אירוע לא תקינים" }, { status: 400 });

  const event = await prisma.event.update({ where: { id: params.id }, data });
  return NextResponse.json(event);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  await prisma.event.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
