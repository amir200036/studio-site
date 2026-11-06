import { MessageCircle } from "lucide-react";
import { workshopInterestWhatsAppHref } from "@/lib/workshop-whatsapp";

type Props = {
  workshop: { name: string; date?: Date | null; durationHours: number; whatsappMessage?: string | null };
  whatsappNumber: string;
};

/** לחיצה אחת ל-WhatsApp. המועד, מספר המשתתפים והמחיר נסגרים בשיחה. */
export function WorkshopInterestLink({ workshop, whatsappNumber }: Props) {
  if (!whatsappNumber.replace(/\D/g, "")) {
    return (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        מספר WhatsApp עדיין לא הוגדר. אפשר לפנות אלינו דרך עמוד צרו קשר.
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-green-100 bg-white p-6 md:p-8 shadow-sm text-center">
      <h2 className="mb-2 text-xl md:text-2xl font-bold text-amber-900">רוצים להצטרף?</h2>
      <p className="mb-6 text-stone-600 leading-relaxed max-w-md mx-auto">
        כתבו לנו ב-WhatsApp — נתאם מועד, נענה על כל שאלה ונשמור לכם מקום.
      </p>
      <a
        href={workshopInterestWhatsAppHref(workshop, whatsappNumber)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-green-600 px-8 py-3 font-bold text-white shadow-md transition-all hover:bg-green-700 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
      >
        <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
        דברו איתנו ב-WhatsApp
      </a>
    </div>
  );
}
