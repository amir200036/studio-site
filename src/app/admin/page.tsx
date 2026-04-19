export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDateTime, formatPrice } from "@/lib/utils";

async function getDashboardData() {
  const now = new Date();
  const [totalBookings, totalRevenue, upcomingWorkshops, recentBookings] = await Promise.all([
    prisma.booking.count({ where: { paymentStatus: "paid" } }),
    prisma.booking.aggregate({ where: { paymentStatus: "paid" }, _sum: { totalAmount: true } }),
    prisma.workshop.findMany({
      where: { status: "active", date: { gte: now } },
      include: { bookings: { where: { paymentStatus: "paid" } } },
      orderBy: { date: "asc" },
    }),
    prisma.booking.findMany({
      where: { paymentStatus: "paid" },
      include: { workshop: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return { totalBookings, totalRevenue: totalRevenue._sum.totalAmount || 0, upcomingWorkshops, recentBookings };
}

export default async function AdminDashboard() {
  const { totalBookings, totalRevenue, upcomingWorkshops, recentBookings } = await getDashboardData();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-stone-800">לוח בקרה</h1>
        <p className="text-stone-400 mt-1">ברוכים הבאים לפאנל הניהול</p>
      </div>

      {/* כרטיסי סטטיסטיקה */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "הזמנות שולמו", value: totalBookings, color: "bg-green-50 text-green-800", icon: "✅" },
          { label: "סדנאות קרובות", value: upcomingWorkshops.length, color: "bg-amber-50 text-amber-800", icon: "📅" },
          { label: "הכנסות", value: `₪${totalRevenue.toLocaleString("he-IL")}`, color: "bg-blue-50 text-blue-800", icon: "💰" },
        ].map((card) => (
          <div key={card.label} className={`${card.color} rounded-2xl p-5`}>
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className="text-3xl font-extrabold">{card.value}</div>
            <div className="text-sm mt-1 opacity-70">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* כל הסדנאות המתוכננות */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-stone-800 text-lg">סדנאות מתוכננות ({upcomingWorkshops.length})</h2>
            <Link href="/admin/workshops" className="text-amber-700 text-sm hover:underline">ניהול סדנאות ←</Link>
          </div>
          {upcomingWorkshops.length === 0 ? (
            <p className="text-stone-400 text-sm">אין סדנאות מתוכננות</p>
          ) : (
            <div className="flex flex-col gap-2">
              {upcomingWorkshops.map((w) => {
                const booked = w.bookings.reduce((s, b) => s + b.seats, 0);
                const pct = booked / w.maxParticipants;
                const color = pct >= 1 ? "bg-red-100 text-red-700" : pct >= 0.7 ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700";
                return (
                  <Link
                    key={w.id}
                    href={`/admin/workshops/${w.id}`}
                    className="flex justify-between items-center py-3 px-4 rounded-xl hover:bg-stone-50 transition-colors border border-stone-100"
                  >
                    <div>
                      <div className="font-medium text-stone-800 text-sm">{w.name}</div>
                      <div className="text-stone-400 text-xs mt-0.5">{formatDateTime(w.date)}</div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${color}`}>
                      {booked}/{w.maxParticipants}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* הזמנות אחרונות */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-stone-800 text-lg">הזמנות אחרונות</h2>
            <Link href="/admin/bookings" className="text-amber-700 text-sm hover:underline">הכל ←</Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-stone-400 text-sm">אין הזמנות עדיין</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentBookings.map((b) => (
                <div key={b.id} className="flex justify-between items-start text-sm py-2 border-b border-stone-50 last:border-0">
                  <div>
                    <div className="font-medium text-stone-700">{b.customerName}</div>
                    <div className="text-stone-400 text-xs">{b.workshop.name}</div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-amber-700">{formatPrice(b.totalAmount)}</div>
                    <div className="text-stone-400 text-xs">{b.seats} מקומות</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
