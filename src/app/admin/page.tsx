export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { visiblePublicWorkshopsWhere } from "@/lib/workshop-filters";
import { formatPrice } from "@/lib/utils";

async function getDashboardData() {
  const [upcomingWorkshops, totalWorkshops, activeWorkshops] = await Promise.all([
    prisma.workshop.findMany({
      where: visiblePublicWorkshopsWhere(),
      orderBy: [{ createdAt: "desc" }],
      take: 10,
    }),
    prisma.workshop.count(),
    prisma.workshop.count({ where: { status: "active" } }),
  ]);

  return { upcomingWorkshops, totalWorkshops, activeWorkshops };
}

export default async function AdminDashboard() {
  const { upcomingWorkshops, totalWorkshops, activeWorkshops } = await getDashboardData();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-800">לוח בקרה</h1>
        <p className="text-stone-400 mt-1">ברוכים הבאים לפאנל הניהול</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md">
        {[
          { label: "סדנאות פעילות", value: activeWorkshops, color: "bg-green-50 text-green-800", icon: "✅" },
          { label: "סה״כ סדנאות", value: totalWorkshops, color: "bg-amber-50 text-amber-800", icon: "📅" },
        ].map((card) => (
          <div key={card.label} className={`${card.color} rounded-2xl p-5`}>
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className="text-3xl font-extrabold">{card.value}</div>
            <div className="text-sm mt-1 opacity-70">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-stone-100">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
          <h2 className="font-bold text-stone-800 text-lg">סדנאות באתר ({upcomingWorkshops.length})</h2>
          <Link href="/admin/workshops" className="text-amber-700 text-sm hover:underline min-h-11 inline-flex items-center">
            ניהול סדנאות ←
          </Link>
        </div>
        {upcomingWorkshops.length === 0 ? (
          <p className="text-stone-400 text-sm">אין סדנאות פעילות</p>
        ) : (
          <div className="flex flex-col gap-2">
            {upcomingWorkshops.map((w) => (
              <Link
                key={w.id}
                href={`/admin/workshops/${w.id}`}
                className="flex justify-between items-center py-3 px-4 min-h-14 rounded-xl hover:bg-stone-50 transition-colors border border-stone-100"
              >
                <div className="font-medium text-stone-800 text-sm">{w.name}</div>
                <span className="text-sm font-bold text-amber-700">{formatPrice(w.pricePerPerson)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
