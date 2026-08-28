// נשמר ב-CDN ומתרענן כל 5 דקות. כל שמירה באדמין קוראת ל-revalidatePath
// ומרעננת מיד, כך שאין המתנה לשינוי תוכן.
export const revalidate = 300;
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { safeDbQuery } from "@/lib/safe-db";
import { DEFAULT_TERMS, TERMS_LAST_UPDATED } from "@/lib/default-terms";

const siteUrl = getSiteUrl().replace(/\/$/, "");

export const metadata: Metadata = {
  title: "תנאי שימוש | יד יוצרת — סדנת קדרות בנס ציונה",
  description:
    "תקנון ותנאי שימוש של סדנת קדרות יד יוצרת — מדיניות ביטול, החזרים, תשלומים ופרטיות.",
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
  openGraph: {
    title: "תנאי שימוש | יד יוצרת — סדנת קדרות בנס ציונה",
    description:
      "תקנון ותנאי שימוש של סדנת קדרות יד יוצרת — מדיניות ביטול, החזרים, תשלומים ופרטיות.",
    url: `${siteUrl}/terms`,
    locale: "he_IL",
    type: "website",
    siteName: "יד יוצרת — סדנת קדרות",
  },
};

export default async function TermsPage() {
  const row = await safeDbQuery(
    () => prisma.siteContent.findUnique({ where: { key: "terms_content" } }),
    null
  );
  const content = row?.value || DEFAULT_TERMS;

  const sections = content.split(/\n\n+/);

  return (
    <div>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10">
          <div className="w-12 h-1 bg-amber-500 rounded-full mb-4" />
          <h1 className="text-4xl font-bold text-amber-900">תקנון האתר</h1>
          <p className="text-stone-500 mt-2">עדכון אחרון: {TERMS_LAST_UPDATED}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-8 border border-stone-100 shadow-sm flex flex-col gap-6">
          {sections.map((section: string, i: number) => {
            const lines = section.split("\n");
            const firstLine = lines[0];
            const isBold = firstLine.startsWith("**") && firstLine.endsWith("**");
            const title = isBold ? firstLine.slice(2, -2) : null;
            const body = isBold ? lines.slice(1).join("\n") : section;

            return (
              <div key={i}>
                {title && (
                  <h2 className="text-lg font-bold text-stone-800 mb-2">{title}</h2>
                )}
                <p className="text-stone-600 leading-relaxed text-sm whitespace-pre-line">{body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
