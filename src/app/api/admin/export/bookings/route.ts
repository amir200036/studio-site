import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { csvRow } from "@/lib/csv";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const bookings = await prisma.booking.findMany({
    include: { workshop: { select: { name: true, date: true } } },
    orderBy: { createdAt: "desc" },
  });

  const bom = "\uFEFF";
  let csv = bom;
  csv += csvRow(["מזהה", "תאריך הרשמה", "שם לקוח", "מייל", "סדנה", "מועד סדנה", "מקומות", "סכום", "סטטוס"]);
  for (const b of bookings) {
    csv += csvRow([
      b.id,
      formatDateTime(b.createdAt),
      b.customerName,
      b.customerEmail,
      b.workshop.name,
      formatDateTime(b.workshop.date),
      b.seats,
      b.totalAmount,
      b.paymentStatus,
    ]);
  }

  const filename = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
