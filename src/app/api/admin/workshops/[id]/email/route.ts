import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCustomEmail } from "@/lib/email";
import { parseAdminEmailInput } from "@/lib/admin-api-validation";
import { requireAdminSession } from "@/lib/require-admin";

interface Params { params: { id: string } }

export async function POST(req: NextRequest, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = parseAdminEmailInput(body);
  if (!parsed) return NextResponse.json({ error: "נושא או תוכן לא תקינים" }, { status: 400 });

  const subject = parsed.subject;
  const message = parsed.body;

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
