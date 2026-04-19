import { prisma } from "@/lib/prisma";
// formatPrice / formatDateTime used in CustomersClient
import { CustomersClient } from "@/components/admin/CustomersClient";

async function getCustomers() {
  const bookings = await prisma.booking.findMany({
    where: { paymentStatus: "paid" },
    include: { workshop: { select: { name: true, date: true } } },
    orderBy: { createdAt: "desc" },
  });

  // קיבוץ לפי מייל
  const map = new Map<string, {
    name: string; email: string;
    bookings: typeof bookings; total: number;
  }>();

  for (const b of bookings) {
    if (!map.has(b.customerEmail)) {
      map.set(b.customerEmail, { name: b.customerName, email: b.customerEmail, bookings: [], total: 0 });
    }
    const c = map.get(b.customerEmail)!;
    c.bookings.push(b);
    c.total += b.totalAmount;
  }

  return Array.from(map.values());
}

export default async function AdminCustomersPage() {
  const customers = await getCustomers();
  return <CustomersClient customers={customers} />;
}
