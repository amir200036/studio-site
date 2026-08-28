export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDateShort, formatPrice } from "@/lib/utils";
import { ExternalLink, ImageOff } from "lucide-react";

async function getWorkshops() {
  return prisma.workshop.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminWorkshopsPage() {
  const workshops = await getWorkshops();

  const activeCount = workshops.filter((w) => w.status === "active").length;
  const totalCapacity = workshops
    .filter((w) => w.status === "active")
    .reduce((sum, w) => sum + w.maxParticipants, 0);
  const withoutImage = workshops.filter((w) => !w.imageUrl?.trim()).length;

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
          <p className="text-stone-400 mt-1">
            {workshops.length} סדנאות · {activeCount} פעילות · {totalCapacity} מקומות
            {withoutImage > 0 && ` · ${withoutImage} בלי תמונה`}
          </p>
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
            {workshops.map((w) => (
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
                <div className="flex justify-between text-sm pt-1 border-t border-stone-100">
                  <span className="font-bold text-amber-700">{formatPrice(w.pricePerPerson)}</span>
                  <span className="text-stone-500">{w.durationHours} שע׳ · עד {w.maxParticipants} משתתפים</span>
                </div>
                {!w.imageUrl?.trim() && (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                    <ImageOff className="w-3.5 h-3.5" aria-hidden="true" />
                    חסרה תמונה
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    {["שם הסדנה", "משך", "מחיר", "לשעה", "מקומות", "תמונה", "סטטוס", "נוצרה", "פעולות"].map((h) => (
                      <th key={h} className="text-right px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {workshops.map((w) => (
                    <tr key={w.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-stone-800">{w.name}</td>
                      <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{w.durationHours} שע׳</td>
                      <td className="px-4 py-3 font-medium text-amber-700 whitespace-nowrap">{formatPrice(w.pricePerPerson)}</td>
                      <td className="px-4 py-3 text-stone-400 whitespace-nowrap">
                        {w.durationHours > 0 ? formatPrice(Math.round(w.pricePerPerson / w.durationHours)) : "—"}
                      </td>
                      <td className="px-4 py-3 text-stone-600 whitespace-nowrap">עד {w.maxParticipants}</td>
                      <td className="px-4 py-3">
                        {w.imageUrl?.trim() ? (
                          <span className="text-green-600 text-xs font-medium">יש</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium" title="לסדנה אין תמונה">
                            <ImageOff className="w-3.5 h-3.5" aria-hidden="true" />
                            חסרה
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[w.status] || ""}`}>
                          {statusLabels[w.status] || w.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-400 text-xs whitespace-nowrap">{formatDateShort(w.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-3 whitespace-nowrap">
                          <Link href={`/admin/workshops/${w.id}`} className="text-amber-700 hover:underline">עריכה</Link>
                          <a
                            href={`/workshops/${w.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-stone-400 hover:text-amber-700"
                            title="צפייה בדף באתר"
                          >
                            <ExternalLink className="w-4 h-4" aria-hidden="true" />
                          </a>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
