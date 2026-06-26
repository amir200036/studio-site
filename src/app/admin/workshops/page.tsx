export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDateTime, formatPrice } from "@/lib/utils";

async function getWorkshops() {
  return prisma.workshop.findMany({
    include: { bookings: { where: { paymentStatus: "paid" } } },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminWorkshopsPage() {
  const workshops = await getWorkshops();

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    blocked: "bg-stone-100 text-stone-600",
  };
  const statusLabels: Record<string, string> = {
    active: "פעילה",
    cancelled: "מבוטלת",
    blocked: "חסומה",
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800">ניהול סדנאות</h1>
          <p className="text-stone-400 mt-1">{workshops.length} סדנאות במערכת</p>
        </div>
        <Link
          href="/admin/workshops/new"
          className="px-5 py-3 min-h-12 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl transition-colors text-center text-base sm:text-sm"
        >
          + סדנה חדשה
        </Link>
      </div>

      {workshops.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 text-center py-16 text-stone-400">
          <p>אין סדנאות עדיין.</p>
          <Link href="/admin/workshops/new" className="text-amber-700 underline mt-2 block min-h-11 inline-flex items-center justify-center">
            צרו סדנה ראשונה
          </Link>
        </div>
      ) : (
        <>
          <div className="md:hidden flex flex-col gap-3">
            {workshops.map((w) => {
              const booked = w.bookings.reduce((s, b) => s + b.seats, 0);
              const pct = booked / w.maxParticipants;
              const fillColor = pct >= 1 ? "text-red-600" : pct >= 0.7 ? "text-orange-600" : "text-green-600";
              return (
                <Link
                  key={w.id}
                  href={`/admin/workshops/${w.id}`}
                  className="bg-white rounded-2xl border border-stone-100 p-4 flex flex-col gap-2 shadow-sm active:bg-stone-50"
                >
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-bold text-stone-800">{w.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusColors[w.status] || ""}`}>
                      {statusLabels[w.status] || w.status}
                    </span>
                  </div>
                  <p className="text-sm text-stone-500">
                    {w.date ? formatDateTime(w.date) : "מועד — ב-WhatsApp"}
                  </p>
                  <div className="flex justify-between text-sm pt-1 border-t border-stone-100">
                    <span className="font-bold text-amber-700">{formatPrice(w.pricePerPerson)}</span>
                    <span className={`font-bold ${fillColor}`}>
                      {booked}/{w.maxParticipants} מקומות
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    {["שם הסדנה", "מועד", "מחיר", "מקומות", "סטטוס", "פעולות"].map((h) => (
                      <th key={h} className="text-right px-4 py-3 font-semibold text-stone-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {workshops.map((w) => {
                    const booked = w.bookings.reduce((s, b) => s + b.seats, 0);
                    const pct = booked / w.maxParticipants;
                    const fillColor = pct >= 1 ? "text-red-600" : pct >= 0.7 ? "text-orange-600" : "text-green-600";
                    return (
                      <tr key={w.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-stone-800">{w.name}</td>
                        <td className="px-4 py-3 text-stone-500">
                          {w.date ? formatDateTime(w.date) : "— (ב-WhatsApp)"}
                        </td>
                        <td className="px-4 py-3">{formatPrice(w.pricePerPerson)}</td>
                        <td className={`px-4 py-3 font-bold ${fillColor}`}>{booked}/{w.maxParticipants}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[w.status] || ""}`}>
                            {statusLabels[w.status] || w.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/workshops/${w.id}`} className="text-amber-700 hover:underline">עריכה</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
