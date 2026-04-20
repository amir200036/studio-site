import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ExternalLink, TrendingUp, Users, CreditCard, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
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
  ]);

  const workshopIds = topWorkshops.map((w) => w.workshopId);
  const workshopNames = await prisma.workshop.findMany({
    where: { id: { in: workshopIds } },
    select: { id: true, name: true },
  });
  const nameMap = Object.fromEntries(workshopNames.map((w) => [w.id, w.name]));

  const statCards = [
    {
      label: "הזמנות היום",
      value: bookingsToday,
      sub: formatPrice(revenueToday._sum.totalAmount ?? 0),
      icon: Calendar,
      color: "bg-amber-50 border-amber-200 text-amber-800",
      iconColor: "text-amber-600",
    },
    {
      label: "הזמנות השבוע",
      value: bookingsWeek,
      sub: formatPrice(revenueWeek._sum.totalAmount ?? 0),
      icon: TrendingUp,
      color: "bg-green-50 border-green-200 text-green-800",
      iconColor: "text-green-600",
    },
    {
      label: "הזמנות החודש",
      value: bookingsMonth,
      sub: formatPrice(revenueMonth._sum.totalAmount ?? 0),
      icon: CreditCard,
      color: "bg-blue-50 border-blue-200 text-blue-800",
      iconColor: "text-blue-600",
    },
    {
      label: "סה\"כ הכל",
      value: totalBookings,
      sub: formatPrice(totalRevenue._sum.totalAmount ?? 0),
      icon: Users,
      color: "bg-stone-50 border-stone-200 text-stone-800",
      iconColor: "text-stone-600",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-stone-800">סטטיסטיקות</h1>

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

      {/* Vercel Analytics link */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="text-lg font-bold text-stone-700 mb-2">סטטיסטיקות מבקרים באתר</h2>
        <p className="text-sm text-stone-500 mb-4">
          נתוני תנועה, דפים פופולריים, מדינות ומכשירים זמינים בלוח הבקרה של Vercel Analytics.
        </p>
        <a
          href="https://vercel.com/dashboard/analytics"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-stone-800 hover:bg-stone-900 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          פתח Vercel Analytics
        </a>
      </div>

      {/* Top workshops last 30 days */}
      {topWorkshops.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-bold text-stone-700 mb-4">סדנאות מובילות — 30 יום אחרונים</h2>
          <div className="space-y-3">
            {topWorkshops.map((w, i) => (
              <div key={w.workshopId} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-stone-400 font-bold text-sm w-5 text-center">{i + 1}</span>
                  <span className="text-stone-700 font-medium truncate">
                    {nameMap[w.workshopId] ?? "סדנה שנמחקה"}
                  </span>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 text-sm text-stone-500">
                  <span>{w._count.id} הזמנות</span>
                  <span className="font-semibold text-stone-700">{formatPrice(w._sum.totalAmount ?? 0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent bookings */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="text-lg font-bold text-stone-700 mb-4">הזמנות אחרונות</h2>
        <div className="overflow-x-auto">
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
