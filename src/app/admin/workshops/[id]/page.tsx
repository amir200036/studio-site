import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WorkshopForm } from "@/components/admin/WorkshopForm";
import { WorkshopBookings } from "@/components/admin/WorkshopBookings";

interface Props {
  params: { id: string };
}

export default async function EditWorkshopPage({ params }: Props) {
  const workshop = await prisma.workshop.findUnique({
    where: { id: params.id },
    include: {
      bookings: {
        include: { workshop: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!workshop) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-stone-800">עריכת סדנה</h1>
        <p className="text-stone-400 mt-1">{workshop.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <WorkshopForm workshop={workshop} />
        <WorkshopBookings bookings={workshop.bookings} workshopId={workshop.id} workshopName={workshop.name} workshopDate={workshop.date} />
      </div>
    </div>
  );
}
