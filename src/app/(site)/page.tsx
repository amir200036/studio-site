export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { GallerySection } from "@/components/home/GallerySection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { WorkshopsPreview } from "@/components/home/WorkshopsPreview";

const BASE_URL = "https://studio-site-one-hazel.vercel.app";

export const metadata: Metadata = {
  title: "סדנת קדרות בנס ציונה | יד יוצרת — חוויה יצירתית לזוגות, משפחות וחברות",
  description:
    "סדנאות קדרות וקרמיקה בנס ציונה — חוויה יצירתית לזוגות, משפחות, ימי הולדת וגיבוש. מדריכים מנוסים, אווירה חמה. הזמינו מקום עכשיו!",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "סדנת קדרות בנס ציונה | יד יוצרת",
    description:
      "סדנאות קדרות וקרמיקה בנס ציונה — חוויה יצירתית לזוגות, משפחות, ימי הולדת וגיבוש. מדריכים מנוסים, אווירה חמה.",
    url: BASE_URL,
    locale: "he_IL",
    type: "website",
    siteName: "יד יוצרת — סדנת קדרות",
  },
};

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
  const hasBgImage = !!content["bg_image_home"];

  // AggregateRating JSON-LD — only when approved reviews exist
  let aggregateRatingSchema = null;
  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = (totalRating / reviews.length).toFixed(1);
    aggregateRatingSchema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "יד יוצרת — סדנת קדרות וקרמיקה",
      url: BASE_URL,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating,
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
    };
  }

  return (
    <>
      {aggregateRatingSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateRatingSchema) }}
        />
      )}
      <div>
        <HeroSection content={content} transparent={hasBgImage} />
        <AboutSection content={content} />
        <WorkshopsPreview workshops={workshops} />
        <GallerySection images={gallery} />
        <ReviewsSection reviews={reviews} />
      </div>
    </>
  );
}
