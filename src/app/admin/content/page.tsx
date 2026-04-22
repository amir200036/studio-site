export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { ContentClient } from "@/components/admin/ContentClient";

async function getData() {
  const [contentRows, faqs, events, gallery, reviews] = await Promise.all([
    prisma.siteContent.findMany(),
    prisma.fAQ.findMany({ orderBy: { order: "asc" } }),
    prisma.event.findMany({ orderBy: { order: "asc" } }),
    prisma.galleryImage.findMany({ orderBy: { order: "asc" } }),
    prisma.review.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const content: Record<string, string> = {};
  contentRows.forEach((r: { key: string; value: string }) => (content[r.key] = r.value));

  return { content, faqs, events, gallery, reviews };
}

export default async function AdminContentPage() {
  const data = await getData();
  return <ContentClient {...data} />;
}
