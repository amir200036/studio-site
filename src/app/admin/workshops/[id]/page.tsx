export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WorkshopForm } from "@/components/admin/WorkshopForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditWorkshopPage({ params }: Props) {
  const { id } = await params;
  const workshop = await prisma.workshop.findUnique({
    where: { id: id },
  });

  if (!workshop) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-800">עריכת סדנה</h1>
        <p className="text-stone-400 mt-1">{workshop.name}</p>
      </div>
      <WorkshopForm workshop={workshop} />
    </div>
  );
}
