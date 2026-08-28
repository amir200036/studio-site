// נשמר ב-CDN ומתרענן כל 5 דקות. כל שמירה באדמין קוראת ל-revalidatePath
// ומרעננת מיד, כך שאין המתנה לשינוי תוכן.
export const revalidate = 300;
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { visiblePublicWorkshopsWhere } from "@/lib/workshop-filters";
import { getAvailableSeats } from "@/lib/utils";
import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { GallerySection } from "@/components/home/GallerySection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { WorkshopsPreview } from "@/components/home/WorkshopsPreview";
import { getSiteUrl } from "@/lib/site-url";
import { safeDbQuery } from "@/lib/safe-db";
import { toJsonLd } from "@/lib/sanitize";

const siteUrl = getSiteUrl().replace(/\/$/, "");

export const metadata: Metadata = {
  title: "סדנת קדרות בנס ציונה | יד יוצרת — חוויה יצירתית לזוגות, משפחות וחברות",
  description:
    "סדנאות קדרות וקרמיקה בנס ציונה — חוויה יצירתית לזוגות, משפחות, ימי הולדת וגיבוש. מדריכים מנוסים, אווירה חמה. הזמינו מקום עכשיו!",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "סדנת קדרות בנס ציונה | יד יוצרת",
    description:
      "סדנאות קדרות וקרמיקה בנס ציונה — חוויה יצירתית לזוגות, משפחות, ימי הולדת וגיבוש. מדריכים מנוסים, אווירה חמה.",
    url: siteUrl,
    locale: "he_IL",
    type: "website",
    siteName: "יד יוצרת — סדנת קדרות",
  },
};

async function getHomeData() {
  return safeDbQuery(async () => {
    const [contentRows, gallery, reviews, workshops] = await Promise.all([
      prisma.siteContent.findMany(),
      prisma.galleryImage.findMany({
        where: { showOnHomepage: true },
        orderBy: { order: "asc" },
        take: 8,
      }),
      prisma.review.findMany({ where: { approved: true }, orderBy: { createdAt: "desc" }, take: 6 }),
      prisma.workshop.findMany({
        where: visiblePublicWorkshopsWhere(),
        include: { bookings: { where: { paymentStatus: "paid" } } },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

    const content: Record<string, string> = {};
    contentRows.forEach((r: { key: string; value: string }) => (content[r.key] = r.value));
    const openWorkshops = workshops
      .filter((w) => getAvailableSeats(w.maxParticipants, w.bookings) > 0)
      .slice(0, 3);
    return { content, gallery, reviews, workshops: openWorkshops };
  }, { content: {}, gallery: [], reviews: [], workshops: [] });
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
      url: siteUrl,
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
          dangerouslySetInnerHTML={{ __html: toJsonLd(aggregateRatingSchema) }}
        />
      )}
      <div>
        <HeroSection content={content} transparent={hasBgImage} />
        <AboutSection content={content} />
        <WorkshopsPreview workshops={workshops} />
        <ReviewsSection reviews={reviews} />
        <GallerySection images={gallery} />
      </div>
    </>
  );
}
