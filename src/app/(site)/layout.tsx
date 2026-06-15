export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const row = await safeDbQuery(
    () => prisma.siteContent.findUnique({ where: { key: "global_bg_color" } }),
    null
  );
  const bgColor = row?.value || "#fdf8f0";

  return (
    <div style={{ backgroundColor: bgColor, minHeight: "100vh" }}>
      <Navbar bgColor={bgColor} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
