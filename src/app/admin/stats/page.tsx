import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { TrendingUp, Users, CreditCard, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

const DAY_LABELS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOf14Days = new Date(startOfToday);
  startOf14Days.setDate(startOfToday.getDate() - 13);
  const startOf30Days = new Date(startOfToday);
  startOf30Days.setDate(startOfToday.getDate() - 30);

  const [
    bookingsToday,
    bookingsWeek,
    bookingsMonth,
    revenueToday,
    revenueWeek,
    revenueMonth,
    totalBookings,
    totalRevenue,
    topWorkshops,
    recentBookings,
    last14Raw,
  ] = await Promise.all([
    prisma.booking.count({ where: { createdAt: { gte: startOfToday }, paymentStatus: "paid" } }),
    prisma.booking.count({ where: { createdAt: { gte: startOfWeek }, paymentStatus: "paid" } }),
    prisma.booking.count({ where: { createdAt: { gte: startOfMonth }, paymentStatus: "paid" } }),
    prisma.booking.aggregate({ where: { createdAt: { gte: startOfToday }, paymentStatus: "paid" }, _sum: { totalAmount: true } }),
    prisma.booking.aggregate({ where: { createdAt: { gte: startOfWeek }, paymentStatus: "paid" }, _sum: { totalAmount: true } }),
    prisma.booking.aggregate({ where: { createdAt: { gte: startOfMonth }, paymentStatus: "paid" }, _sum: { totalAmount: true } }),
    prisma.booking.count({ where: { paymentStatus: "paid" } }),
    prisma.booking.aggregate({ where: { paymentStatus: "paid" }, _sum: { totalAmount: true } }),
    prisma.booking.groupBy({
      by: ["workshopId"],
      where: { paymentStatus: "paid", createdAt: { gte: startOf30Days } },
      _count: { id: true },
      _sum: { totalAmount: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
    prisma.booking.findMany({
      where: { paymentStatus: "paid" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { workshop: { select: { name: true } } },
    }),
    prisma.booking.findMany({
      where: { paymentStatus: "paid", createdAt: { gte: startOf14Days } },
      select: { createdAt: true, totalAmount: true },
    }),
  ]);

  // Build 14-day daily buckets
  const dailyData: Array<{ date: string; label: string; day: string; count: number; amount: number }> = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(startOfToday);
    d.setDate(d.getDate() - i);
    dailyData.push({
      date: d.toISOString().slice(0, 10),
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      day: DAY_LABELS[d.getDay()],
      count: 0,
      amount: 0,
    });
  }
  for (const b of last14Raw) {
    const key = new Date(b.createdAt).toISOString().slice(0, 10);
    const entry = dailyData.find((d) => d.date === key);
    if (entry) { entry.count++; entry.amount += b.totalAmount; }
  }
  const maxCount = Math.max(...dailyData.map((d) => d.count), 1);

  const workshopIds = topWorkshops.map((w) => w.workshopId);
  const workshopNames = await prisma.workshop.findMany({
    where: { id: { in: workshopIds } },
    select: { id: true, name: true },
  });
  const nameMap = Object.fromEntries(workshopNames.map((w) => [w.id, w.name]));

  const statCards = [
    { label: "הזמנות היום", value: bookingsToday, sub: formatPrice(revenueToday._sum.totalAmount ?? 0), icon: Calendar, color: "bg-amber-50 border-amber-200 text-amber-800", iconColor: "text-amber-600" },
    { label: "הזמנות השבוע", value: bookingsWeek, sub: formatPrice(revenueWeek._sum.totalAmount ?? 0), icon: TrendingUp, color: "bg-green-50 border-green-200 text-green-800", iconColor: "text-green-600" },
    { label: "הזמנות החודש", value: bookingsMonth, sub: formatPrice(revenueMonth._sum.totalAmount ?? 0), icon: CreditCard, color: "bg-blue-50 border-blue-200 text-blue-800", iconColor: "text-blue-600" },
    { label: "סה\"כ הכל", value: totalBookings, sub: formatPrice(totalRevenue._sum.totalAmount ?? 0), icon: Users, color: "bg-stone-50 border-stone-200 text-stone-800", iconColor: "text-stone-600" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-stone-800">סטטיסטיקות</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className={`rounded-2xl border p-4 ${card.color}`}>
            <card.icon className={`w-5 h-5 mb-2 ${card.iconColor}`} />
            <div className="text-3xl font-extrabold">{card.value}</div>
            <div className="text-sm font-medium mt-0.5">{card.label}</div>
            <div className="text-xs mt-1 opacity-70">{card.sub} הכנסות</div>
          </div>
        ))}
      </div>

      {/* 14-day bookings chart */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="text-lg font-bold text-stone-700 mb-6">הזמנות — 14 יום אחרונים</h2>
        <div className="flex items-end gap-1 h-36">
          {dailyData.map((d) => {
            const pct = maxCount > 0 ? Math.round((d.count / maxCount) * 100) : 0;
            const isToday = d.date === startOfToday.toISOString().slice(0, 10);
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {d.label}<br />{d.count} הזמנות<br />{formatPrice(d.amount)}
                </div>
                {d.count > 0 && (
                  <span className="text-xs font-bold text-stone-600">{d.count}</span>
                )}
                <div className="w-full flex items-end" style={{ height: 100 }}>
                  <div
                    className={`w-full rounded-t-md transition-all ${isToday ? "bg-amber-500" : "bg-amber-200 group-hover:bg-amber-400"}`}
                    style={{ height: pct > 0 ? `${Math.max(pct, 6)}%` : "2px", opacity: pct === 0 ? 0.3 : 1 }}
                  />
                </div>
                <span className={`text-xs ${isToday ? "font-bold text-amber-700" : "text-stone-400"}`}>{d.day}</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-stone-400 mt-3 text-center">עמודה כתומה כהה = היום</p>
      </div>

      {/* Top workshops */}
      {topWorkshops.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-bold text-stone-700 mb-4">סדנאות מובילות — 30 יום אחרונים</h2>
          <div className="space-y-3">
            {topWorkshops.map((w, i) => {
              const pct = topWorkshops[0]._count.id > 0 ? Math.round((w._count.id / topWorkshops[0]._count.id) * 100) : 0;
              return (
                <div key={w.workshopId} className="flex items-center gap-3">
                  <span className="text-stone-400 font-bold text-sm w-5 text-center flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-stone-700 font-medium text-sm truncate">{nameMap[w.workshopId] ?? "סדנה שנמחקה"}</span>
                      <span className="text-xs text-stone-500 flex-shrink-0 mr-2">{w._count.id} הזמנות · {formatPrice(w._sum.totalAmount ?? 0)}</span>
                    </div>
                    <div className="h-1.5 bg-stone-100 rounded-full">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent bookings */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-bold text-stone-700 mb-4">הזמנות אחרונות</h2>

        <div className="md:hidden flex flex-col gap-3">
          {recentBookings.map((b) => (
            <div key={b.id} className="border border-stone-100 rounded-xl p-4 flex flex-col gap-1">
              <p className="font-medium text-stone-800">{b.customerName}</p>
              <p className="text-sm text-stone-500">{b.workshop.name}</p>
              <div className="flex justify-between text-sm pt-2 border-t border-stone-100 mt-1">
                <span>{b.seats} מקומות</span>
                <span className="font-semibold text-amber-700">{formatPrice(b.totalAmount)}</span>
              </div>
              <p className="text-xs text-stone-400">
                {new Date(b.createdAt).toLocaleDateString("he-IL")}
              </p>
            </div>
          ))}
          {recentBookings.length === 0 && (
            <p className="text-stone-400 text-center py-6">אין הזמנות עדיין</p>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-stone-500 border-b border-stone-100">
                <th className="pb-2 font-medium">לקוח</th>
                <th className="pb-2 font-medium">סדנה</th>
                <th className="pb-2 font-medium">מושבים</th>
                <th className="pb-2 font-medium">סכום</th>
                <th className="pb-2 font-medium">תאריך</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {recentBookings.map((b) => (
                <tr key={b.id} className="text-stone-700">
                  <td className="py-2.5">{b.customerName}</td>
                  <td className="py-2.5 text-stone-500">{b.workshop.name}</td>
                  <td className="py-2.5">{b.seats}</td>
                  <td className="py-2.5 font-semibold">{formatPrice(b.totalAmount)}</td>
                  <td className="py-2.5 text-stone-400 whitespace-nowrap">
                    {new Date(b.createdAt).toLocaleDateString("he-IL")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentBookings.length === 0 && (
            <p className="text-stone-400 text-center py-6">אין הזמנות עדיין</p>
          )}
        </div>
      </div>
    </div>
  );
}
