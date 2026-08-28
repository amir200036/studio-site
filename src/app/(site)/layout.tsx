// נשמר ב-CDN ומתרענן כל 5 דקות. כל שמירה באדמין קוראת ל-revalidatePath
// ומרעננת מיד, כך שאין המתנה לשינוי תוכן.
export const revalidate = 300;
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LocalBusinessJsonLd } from "@/components/seo/LocalBusinessJsonLd";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const row = await safeDbQuery(
    () => prisma.siteContent.findUnique({ where: { key: "global_bg_color" } }),
    null
  );
  const bgColor = row?.value || "#fdf8f0";

  return (
    <div className="overflow-x-clip" style={{ backgroundColor: bgColor, minHeight: "100vh" }}>
      <LocalBusinessJsonLd />
      <Navbar bgColor={bgColor} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
