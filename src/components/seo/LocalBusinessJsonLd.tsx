import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { safeDbQuery } from "@/lib/safe-db";

const DEFAULT_ADDRESS = {
  streetAddress: "אבנר בן יהודה 41",
  addressLocality: "נס ציונה",
};

export async function LocalBusinessJsonLd() {
  const siteUrl = getSiteUrl().replace(/\/$/, "");

  const rows = await safeDbQuery(
    () =>
      prisma.siteContent.findMany({
        where: { key: { in: ["phone", "email", "address", "hours", "whatsapp"] } },
      }),
    []
  );

  const content: Record<string, string> = {};
  rows.forEach((r) => (content[r.key] = r.value));

  const addressText = content.address || `${DEFAULT_ADDRESS.streetAddress}, ${DEFAULT_ADDRESS.addressLocality}`;
  const locality = addressText.includes("נס ציונה") ? "נס ציונה" : DEFAULT_ADDRESS.addressLocality;

  const schema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ArtStudio"],
    name: "יד יוצרת — סדנת קדרות וקרמיקה",
    url: siteUrl,
    description:
      "סדנאות קדרות וקרמיקה בנס ציונה לזוגות, משפחות, ימי הולדת וגיבוש חברה. מדריכים מנוסים, אווירה חמה ומזמינה.",
    address: {
      "@type": "PostalAddress",
      streetAddress: addressText.split(",")[0]?.trim() || DEFAULT_ADDRESS.streetAddress,
      addressLocality: locality,
      addressCountry: "IL",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 31.915333642324743,
      longitude: 34.78527685110109,
    },
    areaServed: { "@type": "City", name: "נס ציונה" },
    priceRange: "₪₪",
    ...(content.phone ? { telephone: content.phone } : {}),
    ...(content.email ? { email: content.email } : {}),
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
