export const dynamic = "force-dynamic";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { IMAGE_CONTENT_KEYS } from "@/lib/site-content-keys";
import { AlertTriangle, Check, Image as ImageIcon, Star, Users, Wallet } from "lucide-react";

async function getStats() {
  const [workshops, events, reviews, faqs, gallery, contentRows, bookings] = await Promise.all([
    prisma.workshop.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.event.findMany(),
    prisma.review.findMany(),
    prisma.fAQ.count(),
    prisma.galleryImage.count(),
    prisma.siteContent.findMany(),
    prisma.booking.count(),
  ]);

  const content: Record<string, string> = {};
  contentRows.forEach((r) => (content[r.key] = r.value));

  return { workshops, events, reviews, faqs, gallery, content, bookings };
}

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 flex flex-col gap-1">
      <span className="flex items-center gap-2 text-sm text-stone-500">
        <Icon className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
        {label}
      </span>
      <span className="text-2xl font-extrabold text-stone-800">{value}</span>
      {hint && <span className="text-xs text-stone-400">{hint}</span>}
    </div>
  );
}

export default async function AdminStatsPage() {
  const { workshops, events, reviews, faqs, gallery, content, bookings } = await getStats();

  const active = workshops.filter((w) => w.status === "active");
  const prices = active.map((w) => w.pricePerPerson).filter((p) => p > 0);
  const capacity = active.reduce((sum, w) => sum + w.maxParticipants, 0);
  const avgRating =
    reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const priceRange =
    prices.length === 0
      ? "—"
      : Math.min(...prices) === Math.max(...prices)
        ? formatPrice(Math.min(...prices))
        : `${formatPrice(Math.min(...prices))}–${formatPrice(Math.max(...prices))}`;

  const workshopsWithoutImage = workshops.filter((w) => !w.imageUrl?.trim());
  const missingBackgrounds = IMAGE_CONTENT_KEYS.filter((k) => !content[k]?.trim());

  // כל בדיקה מצביעה על משהו שאפשר לתקן עכשיו — לא על מספר לשם המספר
  const checks: { ok: boolean; label: string; action?: { href: string; text: string } }[] = [
    {
      ok: gallery > 0,
      label:
        gallery > 0
          ? `${gallery} תמונות בספריית התמונות`
          : "ספריית התמונות ריקה — אין באתר אף תמונה",
      action: { href: "/admin/gallery", text: "לספריית תמונות" },
    },
    {
      ok: workshopsWithoutImage.length === 0,
      label:
        workshopsWithoutImage.length === 0
          ? "לכל הסדנאות יש תמונה"
          : `${workshopsWithoutImage.length} מתוך ${workshops.length} סדנאות בלי תמונה`,
      action: { href: "/admin/workshops", text: "לסדנאות" },
    },
    {
      ok: !!content["about_image"]?.trim(),
      label: content["about_image"]?.trim()
        ? "יש תמונה בקטע 'על הסטודיו'"
        : "אין תמונה בקטע 'על הסטודיו'",
      action: { href: "/admin/content", text: "לניהול תוכן" },
    },
    {
      ok: missingBackgrounds.length === 0,
      label:
        missingBackgrounds.length === 0
          ? "לכל הדפים יש תמונת רקע"
          : `${missingBackgrounds.length} דפים בלי תמונת רקע`,
      action: { href: "/admin/content", text: "לרקעים" },
    },
    {
      ok: active.length > 0,
      label: active.length > 0 ? `${active.length} סדנאות פעילות באתר` : "אין אף סדנה פעילה באתר",
      action: { href: "/admin/workshops", text: "לסדנאות" },
    },
    {
      ok: reviews.length >= 3,
      label:
        reviews.length >= 3
          ? `${reviews.length} ביקורות מוצגות`
          : `רק ${reviews.length} ביקורות — מומלץ לפחות 3`,
      action: { href: "/admin/content", text: "לביקורות" },
    },
  ];

  const openIssues = checks.filter((c) => !c.ok);

  const inventory = [
    { label: "סדנאות", value: `${workshops.length}`, detail: `${active.length} פעילות` },
    {
      label: "אירועים",
      value: `${events.length}`,
      detail: `${events.filter((e) => e.active).length} מוצגים`,
    },
    { label: "שאלות נפוצות", value: `${faqs}`, detail: "" },
    { label: "ביקורות", value: `${reviews.length}`, detail: reviews.length ? `ממוצע ${avgRating.toFixed(1)}` : "" },
    { label: "תמונות בספרייה", value: `${gallery}`, detail: "" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-800">סטטיסטיקות</h1>
        <p className="text-sm text-stone-500 mt-1">תמונת מצב של התוכן באתר.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          icon={Users}
          label="סדנאות פעילות"
          value={`${active.length}`}
          hint={`מתוך ${workshops.length} במערכת`}
        />
        <KpiCard
          icon={Users}
          label="קיבולת כוללת"
          value={`${capacity}`}
          hint="סך המקומות בסדנאות הפעילות"
        />
        <KpiCard icon={Wallet} label="טווח מחירים" value={priceRange} hint="לאדם, בסדנאות פעילות" />
        <KpiCard
          icon={Star}
          label="דירוג ממוצע"
          value={reviews.length ? avgRating.toFixed(1) : "—"}
          hint={reviews.length ? `מתוך ${reviews.length} ביקורות` : "אין ביקורות"}
        />
      </div>

      {/* מה שדורש טיפול — הדבר היחיד בדף שמוביל לפעולה */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-2">
          <h2 className="font-bold text-stone-800">מה דורש טיפול</h2>
          {openIssues.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              {openIssues.length}
            </span>
          )}
        </div>
        <ul className="divide-y divide-stone-50">
          {checks.map((c) => (
            <li key={c.label} className="px-5 py-3 flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm">
                {c.ok ? (
                  <Check className="w-4 h-4 text-green-600 shrink-0" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
                )}
                <span className={c.ok ? "text-stone-500" : "text-stone-800 font-medium"}>{c.label}</span>
              </span>
              {!c.ok && c.action && (
                <Link
                  href={c.action.href}
                  className="text-sm text-amber-700 hover:underline shrink-0 whitespace-nowrap"
                >
                  {c.action.text} ←
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100">
            <h2 className="font-bold text-stone-800">מלאי תוכן</h2>
          </div>
          <ul className="divide-y divide-stone-50">
            {inventory.map((i) => (
              <li key={i.label} className="px-5 py-3 flex items-center justify-between gap-3 text-sm">
                <span className="text-stone-600">{i.label}</span>
                <span className="flex items-baseline gap-2">
                  {i.detail && <span className="text-xs text-stone-400">{i.detail}</span>}
                  <span className="font-bold text-stone-800">{i.value}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100">
            <h2 className="font-bold text-stone-800">מחיר לפי סדנה</h2>
          </div>
          {active.length === 0 ? (
            <p className="px-5 py-6 text-sm text-stone-400">אין סדנאות פעילות.</p>
          ) : (
            <ul className="divide-y divide-stone-50">
              {active.map((w) => (
                <li key={w.id} className="px-5 py-3 flex items-center justify-between gap-3 text-sm">
                  <Link
                    href={`/admin/workshops/${w.id}`}
                    className="text-stone-700 hover:text-amber-700 truncate"
                  >
                    {w.name}
                  </Link>
                  <span className="flex items-baseline gap-2 shrink-0">
                    <span className="text-xs text-stone-400">
                      {formatPrice(Math.round(w.pricePerPerson / w.durationHours))} לשעה
                    </span>
                    <span className="font-bold text-stone-800">{formatPrice(w.pricePerPerson)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* הסבר כן במקום גרף ריק */}
      <div className="bg-stone-50 rounded-2xl border border-stone-200 px-5 py-4 flex items-start gap-3">
        <ImageIcon className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm text-stone-600">
          <p className="font-medium text-stone-700">למה אין כאן נתוני הרשמות והכנסות?</p>
          <p className="mt-1 leading-relaxed">
            ההרשמה לסדנאות מתבצעת ב-WhatsApp, והשיחה לא נרשמת במסד הנתונים — יש כרגע{" "}
            <span className="font-bold">{bookings}</span> הזמנות רשומות. כדי לקבל מספרי נרשמים,
            תפוסה והכנסות צריך לתעד כל הרשמה במערכת, ידנית או בטופס באתר.
          </p>
        </div>
      </div>
    </div>
  );
}
