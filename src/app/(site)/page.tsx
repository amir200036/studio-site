export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { pageBackground } from "@/lib/utils";
import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { GallerySection } from "@/components/home/GallerySection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { WorkshopsPreview } from "@/components/home/WorkshopsPreview";

async function getHomeData() {
  const [contentRows, gallery, reviews, workshops] = await Promise.all([
    prisma.siteContent.findMany(),
    prisma.galleryImage.findMany({ orderBy: { order: "asc" }, take: 8 }),
    prisma.review.findMany({ where: { approved: true }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.workshop.findMany({
      where: { status: "active", date: { gte: new Date() } },
      include: { bookings: { where: { paymentStatus: "paid" } } },
      orderBy: { date: "asc" },
      take: 3,
    }),
  ]);

  const content: Record<string, string> = {};
  contentRows.forEach((r: { key: string; value: string }) => (content[r.key] = r.value));
  return { content, gallery, reviews, workshops };
}

export default async function HomePage() {
  const { content, gallery, reviews, workshops } = await getHomeData();
  return (
    <div style={pageBackground(content["bg_home"] || "", content["bg_image_home"] || "")}>
      <HeroSection content={content} />
      <AboutSection content={content} />
      <WorkshopsPreview workshops={workshops} />
      <GallerySection images={gallery} />
      <ReviewsSection reviews={reviews} />
    </div>
  );
}
