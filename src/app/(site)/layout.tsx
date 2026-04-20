export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const rows = await prisma.siteContent.findMany({
    where: { key: { in: ["global_bg_color", "global_text_color"] } },
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const bgColor = map["global_bg_color"] || "#fdf8f0";
  const textColor = map["global_text_color"] || "#1c1917";

  return (
    <div style={{ backgroundColor: bgColor, color: textColor, minHeight: "100vh" }}>
      <Navbar bgColor={bgColor} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
