import { getSiteUrl } from "@/lib/site-url";
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";
import {
  STUDIO_CITY,
  STUDIO_EMAIL,
  STUDIO_STREET,
  formatStudioPhone,
} from "@/lib/studio-contact";

export async function LocalBusinessJsonLd() {
  const siteUrl = getSiteUrl().replace(/\/$/, "");

  const rows = await safeDbQuery(
    () =>
      prisma.siteContent.findMany({
        where: { key: { in: ["hours", "whatsapp"] } },
      }),
    []
  );

  const content: Record<string, string> = {};
  rows.forEach((r) => (content[r.key] = r.value));

  const schema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ArtStudio"],
    name: "יד יוצרת — סדנת קדרות וקרמיקה",
    url: siteUrl,
    description:
      "סדנאות קדרות וקרמיקה בנס ציונה לזוגות, משפחות, ימי הולדת וגיבוש חברה. מדריכים מנוסים, אווירה חמה ומזמינה.",
    address: {
      "@type": "PostalAddress",
      streetAddress: STUDIO_STREET,
      addressLocality: STUDIO_CITY,
      addressCountry: "IL",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 31.915333642324743,
      longitude: 34.78527685110109,
    },
    areaServed: { "@type": "City", name: STUDIO_CITY },
    priceRange: "₪₪",
    telephone: formatStudioPhone(),
    email: STUDIO_EMAIL,
    openingHours: "Su-Th 09:00-20:00",
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
