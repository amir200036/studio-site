export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getAvailableSeats, pageBackground } from "@/lib/utils";
import { WorkshopCard } from "@/components/workshops/WorkshopCard";

async function getWorkshops() {
  const [workshops, rows] = await Promise.all([
    prisma.workshop.findMany({
      where: { status: "active", date: { gte: new Date() } },
      include: { bookings: { where: { paymentStatus: "paid" } } },
      orderBy: { date: "asc" },
    }),
    prisma.siteContent.findMany({ where: { key: { in: ["bg_image_workshops"] } } }),
  ]);
  const content = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { workshops: workshops.filter((w) => getAvailableSeats(w.maxParticipants, w.bookings) > 0), content };
}

export default async function WorkshopsPage() {
  const { workshops, content } = await getWorkshops();

  return (
    <div style={pageBackground("", content["bg_image_workshops"] || "")}>
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="w-12 h-1 bg-amber-500 rounded-full mb-4" />
        <h1 className="text-4xl font-bold text-amber-900">סדנאות קדרות</h1>
        <p className="text-stone-500 mt-2 text-lg">הצטרפו אלינו לחוויה יצירתית בלתי נשכחת</p>
      </div>

      {workshops.length === 0 ? (
        <div className="text-center py-24 text-stone-400">
          <span className="text-6xl block mb-4">🏺</span>
          <p className="text-xl">אין סדנאות פנויות כרגע</p>
          <p className="text-sm mt-2">בדקו שוב בקרוב — אנחנו מכינים דברים מיוחדים!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workshops.map((workshop) => (
            <WorkshopCard key={workshop.id} workshop={workshop} />
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
