import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendCustomEmail } from "@/lib/email";

interface Params { params: { id: string } }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const subject = body.subject || "עדכון מסטודיו קדרות";
  const message = body.message || "שלום מסטודיו הקדרות!";

  const workshop = await prisma.workshop.findUnique({
    where: { id: params.id },
    include: { bookings: { where: { paymentStatus: "paid" } } },
  });

  if (!workshop) return NextResponse.json({ error: "לא נמצאה" }, { status: 404 });

  const emails = Array.from(new Set(workshop.bookings.map((b) => b.customerEmail)));

  if (emails.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0 });
  }

  const results = await Promise.all(emails.map((email) => sendCustomEmail(email, subject, message)));
  const sent = results.filter(Boolean).length;
  const failed = emails.length - sent;
  if (sent === 0) {
    return NextResponse.json({ error: "כל שליחות המייל נכשלו", failed }, { status: 502 });
  }
  return NextResponse.json({ sent, failed });
}
