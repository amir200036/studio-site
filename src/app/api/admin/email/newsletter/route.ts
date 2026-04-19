import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendCustomEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, body } = await req.json();

  const bookings = await prisma.booking.findMany({
    where: { paymentStatus: "paid" },
    select: { customerEmail: true },
  });

  const emails = Array.from(new Set(bookings.map((b) => b.customerEmail)));

  await Promise.all(emails.map((email) => sendCustomEmail(email, subject, body)));

  return NextResponse.json({ sent: emails.length });
}
