import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSeats } from "@/lib/utils";
import { parseBookingInput } from "@/lib/admin-api-validation";
import { requireAdminSession } from "@/lib/require-admin";

interface Params { params: { id: string } }

export async function POST(req: NextRequest, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await req.json();
  const data = parseBookingInput(body);
  if (!data) return NextResponse.json({ error: "נתוני הזמנה לא תקינים" }, { status: 400 });

  const workshop = await prisma.workshop.findUnique({
    where: { id: params.id },
    include: { bookings: { where: { paymentStatus: "paid" } } },
  });
  if (!workshop) return NextResponse.json({ error: "לא נמצאה" }, { status: 404 });

  const available = getAvailableSeats(workshop.maxParticipants, workshop.bookings);
  if (data.seats > available) {
    return NextResponse.json(
      { error: `אין מספיק מקומות (פנויים: ${available})` },
      { status: 400 }
    );
  }

  const totalAmount = workshop.pricePerPerson * data.seats;

  const booking = await prisma.booking.create({
    data: {
      workshopId: params.id,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      seats: data.seats,
      totalAmount,
      paymentStatus: "paid",
    },
  });

  return NextResponse.json(booking);
}
