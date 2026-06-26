export const dynamic = "force-dynamic";
import { WorkshopForm } from "@/components/admin/WorkshopForm";

export default function NewWorkshopPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-stone-800">סדנה חדשה</h1>
      <WorkshopForm />
    </div>
  );
}
