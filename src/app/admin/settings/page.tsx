export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "@/components/admin/SettingsClient";

async function getSettings() {
  const rows = await prisma.siteContent.findMany({
    where: { key: { in: ["whatsapp", "email", "address", "phone", "hours", "map_embed"] } },
  });
  const map: Record<string, string> = {};
  rows.forEach((r: { key: string; value: string }) => (map[r.key] = r.value));
  return map;
}

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-6 sm:mb-8">הגדרות כלליות</h1>
      <SettingsClient settings={settings} />
    </div>
  );
}
