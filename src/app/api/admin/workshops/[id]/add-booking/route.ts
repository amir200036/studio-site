import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params { params: { id: string } }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { customerName, customerEmail, seats } = await req.json();

  const workshop = await prisma.workshop.findUnique({ where: { id: params.id } });
  if (!workshop) return NextResponse.json({ error: "לא נמצאה" }, { status: 404 });

  const booking = await prisma.booking.create({
    data: {
      workshopId: params.id,
      customerName,
      customerEmail,
      seats,
      totalAmount: 0,
      paymentStatus: "paid",
    },
  });

  return NextResponse.json(booking);
}
