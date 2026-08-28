import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCustomEmail } from "@/lib/email";
import { parseAdminEmailInput } from "@/lib/admin-api-validation";
import { requireAdminSession } from "@/lib/require-admin";

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const data = parseAdminEmailInput(body);
  if (!data) return NextResponse.json({ error: "נושא או תוכן לא תקינים" }, { status: 400 });

  const bookings = await prisma.booking.findMany({
    where: { paymentStatus: "paid" },
    select: { customerEmail: true },
  });

  const emails = Array.from(new Set(bookings.map((b) => b.customerEmail)));

  if (emails.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0 });
  }

  const results = await Promise.all(
    emails.map((email) => sendCustomEmail(email, data.subject, data.body))
  );
  const sent = results.filter(Boolean).length;
  const failed = emails.length - sent;
  if (sent === 0) {
    return NextResponse.json({ error: "כל שליחות המייל נכשלו", failed }, { status: 502 });
  }
  return NextResponse.json({ sent, failed });
}
