export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatPrice } from "@/lib/utils";

async function getBookings() {
  return prisma.booking.findMany({
    include: { workshop: { select: { name: true, date: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminBookingsPage() {
  const bookings = await getBookings();

  const statusLabels: Record<string, string> = { paid: "שולם", pending: "ממתין", refunded: "בוטל", cancelled: "בוטל" };
  const statusColors: Record<string, string> = {
    paid: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    refunded: "bg-stone-100 text-stone-500",
    cancelled: "bg-stone-100 text-stone-500",
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">הזמנות</h1>
          <p className="text-stone-400 mt-1">{bookings.length} הזמנות במערכת</p>
        </div>
        <a
          href="/api/admin/export/bookings"
          className="text-sm font-bold text-amber-800 hover:text-amber-900 px-4 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors"
        >
          הורדת CSV
        </a>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                {["שם לקוח", "מייל", "סדנה", "תאריך הרשמה", "מקומות", "סכום", "סטטוס"].map((h) => (
                  <th key={h} className="text-right px-4 py-3 font-semibold text-stone-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-stone-800">{b.customerName}</td>
                  <td className="px-4 py-3 text-stone-500 text-xs" dir="ltr">{b.customerEmail}</td>
                  <td className="px-4 py-3 text-stone-600">{b.workshop.name}</td>
                  <td className="px-4 py-3 text-stone-400 text-xs">{formatDateTime(b.createdAt)}</td>
                  <td className="px-4 py-3">{b.seats}</td>
                  <td className="px-4 py-3 font-bold text-amber-700">{formatPrice(b.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[b.paymentStatus] || ""}`}>
                      {statusLabels[b.paymentStatus] || b.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
