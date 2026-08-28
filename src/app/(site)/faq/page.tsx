export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { pageBackground } from "@/lib/utils";
import { FAQAccordion } from "@/components/faq/FAQAccordion";
import { getSiteUrl } from "@/lib/site-url";
import { safeDbQuery } from "@/lib/safe-db";
import { toJsonLd } from "@/lib/sanitize";

const siteUrl = getSiteUrl().replace(/\/$/, "");

export const metadata: Metadata = {
  title: "שאלות נפוצות | יד יוצרת — סדנת קדרות בנס ציונה",
  description:
    "תשובות לשאלות הנפוצות ביותר על סדנאות קדרות בנס ציונה — מחירים, רמות ניסיון, מדיניות ביטול, גיל מינימלי ועוד.",
  alternates: {
    canonical: `${siteUrl}/faq`,
  },
  openGraph: {
    title: "שאלות נפוצות | יד יוצרת — סדנת קדרות בנס ציונה",
    description:
      "תשובות לשאלות הנפוצות ביותר על סדנאות קדרות בנס ציונה — מחירים, רמות ניסיון, מדיניות ביטול, גיל מינימלי ועוד.",
    url: `${siteUrl}/faq`,
    locale: "he_IL",
    type: "website",
    siteName: "יד יוצרת — סדנת קדרות",
  },
};

async function getFAQs() {
  return safeDbQuery(async () => {
    const [faqs, rows] = await Promise.all([
      prisma.fAQ.findMany({ orderBy: { order: "asc" } }),
      prisma.siteContent.findMany({ where: { key: { in: ["bg_image_faq"] } } }),
    ]);
    const content = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return { faqs, content };
  }, { faqs: [], content: {} });
}

export default async function FAQPage() {
  const { faqs, content } = await getFAQs();

  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(faqSchema) }}
        />
      )}
      <div style={pageBackground("", content["bg_image_faq"] || "")}>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="mb-12 text-center">
            <div className="w-12 h-1 bg-amber-500 rounded-full mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-amber-900">שאלות נפוצות</h1>
            <p className="text-stone-500 mt-2 text-lg">כל מה שרציתם לדעת על הסטודיו שלנו</p>
          </div>

          {faqs.length === 0 ? (
            <p className="text-center text-stone-400 py-12">אין שאלות כרגע. בדקו שוב בקרוב!</p>
          ) : (
            <FAQAccordion faqs={faqs} />
          )}
        </div>
      </div>
    </>
  );
}
