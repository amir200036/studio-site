import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendCancellationEmail } from "@/lib/email";

interface Params { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const workshop = await prisma.workshop.update({ where: { id: params.id }, data: body });
  return NextResponse.json(workshop);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workshop = await prisma.workshop.findUnique({
    where: { id: params.id },
    include: { bookings: { where: { paymentStatus: "paid" } } },
  });

  if (!workshop) return NextResponse.json({ error: "לא נמצאה" }, { status: 404 });

  // שליחת מיילי ביטול לכל הנרשמים
  await Promise.all(
    workshop.bookings.map((b) =>
      sendCancellationEmail(b.customerEmail, b.customerName, workshop.name, workshop.date)
    )
  );

  await prisma.workshop.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
