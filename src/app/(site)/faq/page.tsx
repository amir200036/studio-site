export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { pageBackground } from "@/lib/utils";
import { FAQAccordion } from "@/components/faq/FAQAccordion";

async function getFAQs() {
  const [faqs, rows] = await Promise.all([
    prisma.fAQ.findMany({ orderBy: { order: "asc" } }),
    prisma.siteContent.findMany({ where: { key: { in: ["bg_faq", "bg_image_faq"] } } }),
  ]);
  const content = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { faqs, content };
}

export default async function FAQPage() {
  const { faqs, content } = await getFAQs();

  return (
    <div style={pageBackground(content["bg_faq"] || "", content["bg_image_faq"] || "")}>
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
  );
}
