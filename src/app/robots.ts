import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

// נשמר ב-CDN ומתרענן כל 5 דקות. כל שמירה באדמין קוראת ל-revalidatePath
// ומרעננת מיד, כך שאין המתנה לשינוי תוכן.
export const revalidate = 300;

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl().replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "cohere-ai", allow: "/" },
      { userAgent: "Bytespider", allow: "/" },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
