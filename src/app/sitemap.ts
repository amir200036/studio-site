import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { visiblePublicWorkshopsWhere } from "@/lib/workshop-filters";
import { getSiteUrl } from "@/lib/site-url";

// נשמר ב-CDN ומתרענן כל 5 דקות. כל שמירה באדמין קוראת ל-revalidatePath
// ומרעננת מיד, כך שאין המתנה לשינוי תוכן.
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = getSiteUrl().replace(/\/$/, "");
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/workshops`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/events`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  try {
    const workshops = await prisma.workshop.findMany({
      where: visiblePublicWorkshopsWhere(),
      select: { id: true, updatedAt: true },
    })

    const workshopPages: MetadataRoute.Sitemap = workshops.map((w) => ({
      url: `${BASE_URL}/workshops/${w.id}`,
      lastModified: w.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...workshopPages]
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticPages;
  }
}
