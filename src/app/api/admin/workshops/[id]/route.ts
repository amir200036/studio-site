import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCancellationEmail } from "@/lib/email";
import { parseWorkshopPatch } from "@/lib/admin-api-validation";
import { requireAdminSession } from "@/lib/require-admin";
import { deleteBlobIfUnreferenced } from "@/lib/blob-cleanup";
import { revalidateSite } from "@/lib/revalidate-site";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await req.json().catch(() => null);

  const existing = await prisma.workshop.findUnique({ where: { id: id } });
  if (!existing) return NextResponse.json({ error: "לא נמצאה" }, { status: 404 });

  const data = parseWorkshopPatch(body, existing);
  if (!data) return NextResponse.json({ error: "נתוני סדנה לא תקינים" }, { status: 400 });

  const workshop = await prisma.workshop.update({ where: { id: id }, data });
  if (existing.imageUrl && existing.imageUrl !== workshop.imageUrl) {
    await deleteBlobIfUnreferenced(existing.imageUrl);
  }

  revalidateSite();
  return NextResponse.json(workshop);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const { error } = await requireAdminSession();
  if (error) return error;

  const workshop = await prisma.workshop.findUnique({
    where: { id: id },
    include: { bookings: { where: { paymentStatus: "paid" } } },
  });

  if (!workshop) return NextResponse.json({ error: "לא נמצאה" }, { status: 404 });

  await Promise.all(
    workshop.bookings.map((b) =>
      sendCancellationEmail(b.customerEmail, b.customerName, workshop.name, workshop.date)
    )
  );

  await prisma.workshop.delete({ where: { id: id } });
  await deleteBlobIfUnreferenced(workshop.imageUrl);

  revalidateSite();
  return NextResponse.json({ success: true });
}
