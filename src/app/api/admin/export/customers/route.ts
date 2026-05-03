import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { csvRow } from "@/lib/csv";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const bookings = await prisma.booking.findMany({
    where: { paymentStatus: "paid" },
    orderBy: { createdAt: "desc" },
  });

  const map = new Map<
    string,
    { name: string; email: string; count: number; total: number }
  >();

  for (const b of bookings) {
    const key = b.customerEmail.toLowerCase();
    if (!map.has(key)) {
      map.set(key, { name: b.customerName, email: b.customerEmail, count: 0, total: 0 });
    }
    const c = map.get(key)!;
    c.count += 1;
    c.total += b.totalAmount;
    if (b.customerName) c.name = b.customerName;
  }

  const rows = Array.from(map.values()).sort((a, b) => a.email.localeCompare(b.email));

  const bom = "\uFEFF";
  let csv = bom;
  csv += csvRow(["מייל", "שם", "מספר הזמנות", "סכום מצטבר"]);
  for (const c of rows) {
    csv += csvRow([c.email, c.name, c.count, c.total]);
  }

  const filename = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
