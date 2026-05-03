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

  if (emails.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0 });
  }

  const results = await Promise.all(emails.map((email) => sendCustomEmail(email, subject, body)));
  const sent = results.filter(Boolean).length;
  const failed = emails.length - sent;
  if (sent === 0) {
    return NextResponse.json({ error: "כל שליחות המייל נכשלו", failed }, { status: 502 });
  }
  return NextResponse.json({ sent, failed });
}
