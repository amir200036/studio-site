import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** ביטול הרשמה במערכת (ללא תשלום אונליין — ללא החזר אוטומטי) */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { workshop: true },
  });

  if (!booking) return NextResponse.json({ error: "הזמנה לא נמצאה." }, { status: 404 });

  if (booking.paymentStatus === "refunded" || booking.paymentStatus === "cancelled") {
    return NextResponse.json({ error: "ההזמנה כבר בוטלה." }, { status: 400 });
  }

  if (booking.paymentStatus !== "paid") {
    return NextResponse.json({ error: "ניתן לבטל רק הרשמות בסטטוס שולם." }, { status: 400 });
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      paymentStatus: "refunded",
      cancelledAt: new Date(),
      refundId: null,
    },
  });

  return NextResponse.json({ success: true });
}
