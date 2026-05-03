export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://studio-site-one-hazel.vercel.app";

export const metadata: Metadata = {
  title: "תנאי שימוש | יד יוצרת — סדנת קדרות בנס ציונה",
  description:
    "תקנון ותנאי שימוש של סדנת קדרות יד יוצרת — מדיניות ביטול, החזרים, תשלומים ופרטיות.",
  alternates: {
    canonical: `${BASE_URL}/terms`,
  },
  openGraph: {
    title: "תנאי שימוש | יד יוצרת — סדנת קדרות בנס ציונה",
    description:
      "תקנון ותנאי שימוש של סדנת קדרות יד יוצרת — מדיניות ביטול, החזרים, תשלומים ופרטיות.",
    url: `${BASE_URL}/terms`,
    locale: "he_IL",
    type: "website",
    siteName: "יד יוצרת — סדנת קדרות",
  },
};

const DEFAULT_TERMS = `**1. כללי**
אתר זה מופעל על ידי סטודיו קדרות. השימוש באתר ובשירותיו מהווה הסכמה לתנאים המפורטים להלן.

**2. הרשמה לסדנאות**
ההרשמה מתבצעת דרך האתר (טופס שמפנה ל-WhatsApp) או בטלפון. המחירים מוצגים באתר לכל סדנה. שמירת מקום ותשלום מתואמים מול הסטודיו לאחר פנייתכם. הסטודיו שומר לעצמו את הזכות לבטל סדנה עקב אי-עמידה במספר המשתתפים המינימלי.

**3. תשלומים**
אין תשלום באשראי דרך האתר. התשלום מתבצע ישירות מול הסטודיו (למשל העברה בנקאית, מזומן או אמצעי אחר שיסוכם ביניכם). המחירים מוצגים בשקלים חדשים (₪) וכוללים מע"מ, אלא אם צוין אחרת.

**4. ביטולים והחזרים**
• מדיניות ביטול והחזרים נקבעת מול הסטודיו בכל מקרה.
• ככלל מקובל: ביטול עד 48 שעות לפני מועד הסדנה — ניתן לבקש החזר מלא לפי הסכמה מראש.
• ביטול פחות מ-48 שעות לפני — ייתכן שלא יינתן החזר; ניתן לבקש להעביר את המקום לאדם אחר.
• ביטול מצד הסטודיו (למשל סדנה שלא מתקיימת) — החזר כספי מלא יסוכם מולכם.

**5. קניין רוחני**
כל התמונות, הטקסטים והתכנים באתר שייכים לסטודיו קדרות. אין להעתיק, לשכפל או לעשות שימוש מסחרי בתכנים ללא אישור מפורש בכתב.

**6. פרטיות**
במהלך ההרשמה לסדנאות נשמרים הפרטים הבאים בלבד: שם מלא וכתובת מייל. הנתונים משמשים לאישור ההזמנה ולתקשורת בנוגע לסדנה בלבד ולא יועברו לצד שלישי.

**7. יצירת קשר**
לכל שאלה בנוגע לתקנון זה ניתן לפנות אלינו דרך עמוד צרו קשר באתר.`;

export default async function TermsPage() {
  const row = await prisma.siteContent.findUnique({ where: { key: "terms_content" } });
  const content = row?.value || DEFAULT_TERMS;

  const sections = content.split(/\n\n+/);

  return (
    <div>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10">
          <div className="w-12 h-1 bg-amber-500 rounded-full mb-4" />
          <h1 className="text-4xl font-bold text-amber-900">תקנון האתר</h1>
          <p className="text-stone-500 mt-2">עדכון אחרון: {new Date().getFullYear()}</p>
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
